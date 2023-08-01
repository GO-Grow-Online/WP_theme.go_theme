jQuery(function($) {
    // dynamic_title_repeater_accordion('rep', 't');
});

function dynamic_title_repeater_accordion(repeater_name, field_name) {
    var information_tabs = jQuery("div[data-name='" + repeater_name + "']");
    if (information_tabs.length) {
        var selector = "tr:not(.acf-clone) td.acf-fields .acf-accordion-content div[data-name='" + field_name + "'] input";

        // Ajouter l'écouteur
        jQuery(information_tabs).on('input', selector, function() {
            var me = jQuery(this);
            me.closest('td.acf-fields').find('.acf-accordion-title label').text(me.val());
        });

        // Déclencher la fonction lors du chargement
        information_tabs.find(selector).trigger('input');
    }
}
