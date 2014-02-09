// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-

const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Gettext = imports.gettext;
const _ = Gettext.domain('aliento').gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.utils;

let _settings;

function init() {
    _settings = Convenience.getSettings();
}

const AlientoPrefsWidget = new GObject.Class({
    Name: 'WindowList.Prefs.Widget',
    GTypeName: 'AlientoPrefsWidget',
    Extends: Gtk.Frame,

    _init: function(params) {
        this.parent(params);

        let locales = Me.dir.get_path() + "/locale";
        Gettext.bindtextdomain('aliento', locales);

        this.shadow_type = Gtk.ShadowType.NONE;
        this.margin = 24;

        let title = '<b>' + _("Configuracion Aliento diario") + '</b>';
        let titleLabel = new Gtk.Label({ use_markup: true, label: title });
        this.set_label_widget(titleLabel);

        let align = new Gtk.Alignment({ left_padding: 20, top_padding: 20 });
        this.add(align);

        const clickActionOptions = [
          [_("Español")     , 0],
          [_("Ingles")     , 1]
        ];

        const currentClickAction = _settings.get_enum('idioma-aliento');

        const comboBoxDefaultClickAction = getComboBox(
          clickActionOptions, GObject.TYPE_INT, currentClickAction,
          function (value) _settings.set_enum('idioma-aliento', value)
        );

        const labelCombo = new Gtk.Label({
          label: _('Idioma del aliento'),
          xalign: 0,
          expand: true
        });

        const hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL,
                  margin_top: 5,
                  expand: false
                });

        align.add(hbox);

        hbox.add(labelCombo);
        hbox.add(comboBoxDefaultClickAction);
    }

});

function getComboBox(options, valueType, defaultValue, callback) {
    let model = new Gtk.ListStore();

    let Columns = { LABEL: 0, VALUE: 1 };

    model.set_column_types([GObject.TYPE_STRING, valueType]);

    let comboBox = new Gtk.ComboBox({model: model});
    let renderer = new Gtk.CellRendererText();

    comboBox.pack_start(renderer, true);
    comboBox.add_attribute(renderer, 'text', 0);

    for each (let [label, value] in options) {
      let iter;

      model.set(
          iter = model.append(),
          [Columns.LABEL, Columns.VALUE],
          [label, value]
      );

      if (value === defaultValue) {
          comboBox.set_active_iter(iter);
      }
    }

    comboBox.connect('changed', function (entry) {
      let [success, iter] = comboBox.get_active_iter();

      if (!success) {
          return;
      }

      let value = model.get_value(iter, Columns.VALUE);

      callback(value);
    });

    return comboBox;
  }



function buildPrefsWidget() {
    let widget = new AlientoPrefsWidget();
    widget.show_all();

    return widget;
}
