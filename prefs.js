// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-

const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Gettext = imports.gettext.domain('gnome-shell-extensions');
const _ = Gettext.gettext;

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

        this.shadow_type = Gtk.ShadowType.NONE;
        this.margin = 24;

        let title = '<b>' + _("Idioma Aliento") + '</b>';
        let titleLabel = new Gtk.Label({ use_markup: true, label: title });
        this.set_label_widget(titleLabel);

        let align = new Gtk.Alignment({ left_padding: 12 });
        this.add(align);

        let grid = new Gtk.Grid({ orientation: Gtk.Orientation.VERTICAL,
                                  row_spacing: 6,
                                  column_spacing: 6,
                                  margin_top: 6 });
        align.add(grid);

        const clickActionOptions = [
          [_("Español")     , 0],
          [_("English")     , 1]
        ];

        const currentClickAction = _settings.get_enum('idioma-aliento');

        const comboBoxDefaultClickAction = getComboBox(
          clickActionOptions, GObject.TYPE_INT, currentClickAction,
          function (value) _settings.set_enum('idioma-aliento', value)
        );

        grid.add(comboBoxDefaultClickAction);
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
