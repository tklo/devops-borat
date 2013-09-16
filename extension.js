const St = imports.gi.St;
const Gtk = imports.gi.Gtk;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Main = imports.ui.main;
const Lang = imports.lang;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Meta = imports.gi.Meta;
const Tweener = imports.ui.tweener;

const MessageTray = imports.ui.messageTray;

const Gettext = imports.gettext;
const _ = Gettext.domain('gnome-shell-extensions').gettext;

const URL = "http://www.sgi.org/es/presidente-de-la-sgi/aliento-diario.html";

let meta;
let aliento;
let notificacion;

function AlientoDiario(metadata)
{
	let locales = metadata.path + "/locale";
	Gettext.bindtextdomain('alientoDiario', locales);

	this._init();
}

AlientoDiario.prototype =
{
	__proto__: PanelMenu.Button.prototype,

    	_init: function() 
    	{

		PanelMenu.Button.prototype._init.call(this, St.Align.START);

		this.mainBox = null;

		notificacion = new MessageTray.Source(
      		"Aliento diario", "icono"
    	);

		let theme = imports.gi.Gtk.IconTheme.get_default();
  		theme.append_search_path(meta.path + '/imagenes');

		this.botonAliento = new St.Icon({
      		icon_name: "icono",
      		style_class: 'system-status-icon'
		});

		this.actor.add_actor(this.botonAliento);

		this._refresh();
	},

	_refresh: function()
	{    		
		let tasksMenu = this.menu;
		let botonAliento = this.botonAliento;

		if (this.mainBox != null)
			this.mainBox.destroy();
			
		this.mainBox = new St.BoxLayout();
		this.mainBox.set_vertical(true);
		
		this.alientoBox = new St.BoxLayout();
		this.alientoBox.set_vertical(true);

		this.scrollView = new St.ScrollView({style_class: 'vfade',
                                          hscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
                                          vscrollbar_policy: Gtk.PolicyType.AUTOMATIC});
		this.scrollView.add_actor(this.alientoBox);
		this.mainBox.add_actor(this.scrollView);


		let archivo = Gio.file_new_for_uri(URL);

		/*TODO: Ajustar el string
				*/

		let alientoTexto;
		alientoTexto = obtenerAliento(archivo.load_contents(null).toString());
		alientoTexto = reemplazarCaracteres(alientoTexto);
		alientoTexto = ajustarTexto(alientoTexto);
		

		this.alientoBox.get_parent().add_style_class_name("boxStyle");

		let titulo = new St.Label({ text: _("Aliento diario"),
                                          style_class: 'alientoTitulo' });

		this.alientoBox.add(titulo);

        let label = new St.Label({ text: _(alientoTexto),
                                          style_class: 'alientoTexto' });

		this.alientoBox.add(label);


		// Separator
		this.Separator = new PopupMenu.PopupSeparatorMenuItem();
		this.mainBox.add_actor(this.Separator.actor);

		
		this.mainBox.add_actor(addFacebookShare(alientoTexto));
		tasksMenu.addActor(this.mainBox);
	},

	_enable: function()
	{		
		//Cuando cambia el archivo	
		let alientoArchivo = Gio.file_new_for_uri(URL);
		this.monitor = alientoArchivo.monitor(Gio.FileMonitorFlags.NONE, null);
		this.monitor.connect('changed', Lang.bind(this, this._refresh));
	},

	_disable: function()
	{
		global.display.remove_keybinding(key_open);
		this.monitor.cancel();
	}
}

function obtenerAliento(string)
{
	let cortado = string.substring(string.search("dailyBlock"), string.search("<p><span>Daisaku Ikeda, presidente de la SGI</span></p>"));
	cortado = cortado.substring(cortado.search("</h2>"), cortado.search("<p>&nbsp;</p>"));
	cortado = cortado.substring(cortado.search("<p>"), cortado.search("</p>"));
	cortado = cortado.replace("<p>", "");

	return cortado;
}

function reemplazarCaracteres(string){
	string = string.replace(/&aacute;/g, "á");
	string = string.replace(/&Aacute;/g, "Á");
	string = string.replace(/&eacute;/g, "é");
	string = string.replace(/&Eacute;/g, "É");
	string = string.replace(/&iacute;/g, "í");
	string = string.replace(/&Iacute;/g, "Í");
	string = string.replace(/&oacute;/g, "ó");
	string = string.replace(/&Oacute;/g, "Ó");
	string = string.replace(/&uacute;/g, "ú");
	string = string.replace(/&Uacute;/g, "Ú");
	string = string.replace(/&ntilde;/g, "ñ");
	string = string.replace(/&Ntilde;/g, "Ñ");

	string = string.replace(/<em>/g, "");
	string = string.replace(/<\/em>/g, "");

	return string;
}

function ajustarTexto(string){
	let flagPalabra = false;
	let iInicio = 0;
	let salida = "";

	for (var i=0; i < string.length; i++) {
		if((i%78 == 0) && (!flagPalabra) && (i != 0)){
			flagPalabra = true;
		}

		if(flagPalabra){
			if(string.charAt(i) == " "){
				salida = salida + string.substring(iInicio, i) + "\n";
				flagPalabra = false;
				iInicio = i;
			}
		}
    }

    if(!flagPalabra){
    	salida = salida + string.substring(iInicio, string.length) + "";
    }

	return salida;
}

function addFacebookShare(alientoTexto){
	this.botonBox = new St.BoxLayout();
	this.botonBox.set_vertical(true);

	this.botonFacebook = new St.Button({
        track_hover: true,
        reactive: true,
        toggle_mode: true
    });

    this.iconoFacebook = new St.Icon({
        icon_name: 'facebookIcono',
        style_class: 'botones'
    });

    this.botonFacebook.add_actor(this.botonBox);

    this.botonBox.add(this.iconoFacebook, {
        x_fill: false,
        x_align: St.Align.MIDDLE
    });

    this.labelFacebook = new St.Label();
    this.labelFacebook.clutter_text.set_markup("Compartir");

    this.botonBox.add(this.labelFacebook, {
        x_fill: false,
        y_align: St.Align.MIDDLE
    });

    this.labelFacebook.visible = false;

	//Conexiones
    this.botonFacebook.connect(
    	'clicked', 
    	Lang.bind(this, function() {
    		alientoTexto = alientoTexto.replace(/ /g, "%20");
    		alientoTexto = alientoTexto.replace(/\n/g, "%20");
    		let url = "https://www.facebook.com/dialog/feed?%20app_id=1441582136067833&display=popup&caption=%20&picture=http://www.japanese-buddhism.com/image-files/1000px-hachiyourenge.png&description="+alientoTexto+"&link=http://www.sgi.org/es/presidente-de-la-sgi/aliento-diario.html&redirect_uri=http://facebook.com";

    		let n = new MessageTray.Notification(
        		notificacion, _("Aliento")
    		);

    		Main.messageTray.add(notificacion);
    		notificacion.notify(n);

    		n.setResident(true);

		    n.update(_("Compartir en facebook"), url);
		    n.addButton('copy', _("Copiar Link"));

		    n.connect('action-invoked', function (ns, action) {
		      if (action == 'copy') {
		        St.Clipboard.get_default().set_text(St.ClipboardType.PRIMARY, url);
		        St.Clipboard.get_default().set_text(St.ClipboardType.CLIPBOARD, url);
		      }
		    });

		    notificacion.notify(n);
	}));

	this.botonFacebook.connect(
        'enter-event',
        Lang.bind(this, function() {
        	this.labelFacebook.opacity = 0;
    		this.labelFacebook.show();

        	Tweener.addTween(this.labelFacebook, {
            	time: 0.5,
            	opacity: 255,
            	transition: 'easeOutQuad'
        	});
    }));

    this.botonFacebook.connect(
        'leave-event',
        Lang.bind(this, function() {
        	Tweener.addTween(this.labelFacebook, {
	            time: 0.5,
	            opacity: 0,
	            transition: 'easeOutQuad',
	            onComplete: Lang.bind(this, function() {
	                this.labelFacebook.hide();
        		})
    		});
    }));

    return this.botonFacebook;
}

function init(metadata) 
{		
	meta = metadata;
}

function enable()
{
	aliento = new AlientoDiario(meta);
	aliento._enable();
	Main.panel.addToStatusArea('Aliento Diario', aliento);
}

function disable()
{
	aliento._disable();
	aliento.destroy();
	aliento = null;
}
