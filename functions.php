<?php
/**
 * GO : Grow Online theme - based on Timber starter theme
 * https://github.com/timber/starter-theme
 *
 * @package  WordPress
 * @subpackage  Timber
 * @since   Timber 0.1
 */


// Disable gutenberg editor
function classic_editor() {
	add_filter('use_block_editor_for_post', '__return_false', 10);
}
add_action( 'init', 'classic_editor');

// Give "Editor" role menu edition capability
function give_editor_access_to_menus() {
	$role = get_role( 'editor' );
	$role->add_cap( 'edit_menus' );

	$current_user = wp_get_current_user();
    if (in_array('editor', $current_user->roles)) {
		global $submenu;
		// Remove "themes"
        unset($submenu['themes.php'][5]);
		// Remove "customize"
        unset($submenu['themes.php'][6]);
    }
}
add_action( 'admin_init', 'give_editor_access_to_menus' );
 
// Image formats
add_image_size( 'card-thumbnail', 550, null, false );

// Remove unused image sizes
add_filter('intermediate_image_sizes', function($sizes) {
  return array_diff($sizes, ['medium_large']);  // Medium Large (768 x 0)
});

add_action( 'init', 'j0e_remove_large_image_sizes' );
function j0e_remove_large_image_sizes() {
  remove_image_size( '1536x1536' );             // 2 x Medium Large (1536 x 1536)
  remove_image_size( '2048x2048' );             // 2 x Large (2048 x 2048)
}

// Scripts & APIs
function my_theme_scripts() {
	// wp_enqueue_script( 'slick', get_template_directory_uri() . '/assets/js/slick.js', array( 'jquery' ), null, true );
	// wp_enqueue_script( 'lightbox', get_template_directory_uri() . '/assets/js/lightbox.js', array( 'jquery' ), null, true );
	// Pass the admin-ajax.php URL to the custom JavaScript file
	wp_enqueue_script( 'script', get_template_directory_uri() . '/assets/js/app.js', array( 'jquery' ), null, true );
    wp_localize_script('ajax_form_url', 'ajax_form_url', array('ajax_url' => admin_url('send_form.php')));
}
add_action( 'wp_enqueue_scripts', 'my_theme_scripts' );

// Style de l'administration
function wpse_admin_styles() {
    wp_enqueue_style( 'admin-css', get_template_directory_uri() . '/admin-style.css' );
}
add_action( 'admin_enqueue_scripts', 'wpse_admin_styles' );

// Script de l'administration
function acf_admin_enqueue_script($hook) {
    if ('post.php' !== $hook) {
        return;
    }
    wp_enqueue_script('admin-js',  get_template_directory_uri() . '/assets/js/admin.js', array('jquery'), '1.0', true );
}

add_action('admin_enqueue_scripts', 'acf_admin_enqueue_script');

// Allow svg files in media
function cc_mime_types($mimes) {
	$mimes['svg'] = 'image/svg+xml';
	return $mimes;
}
add_filter('upload_mimes', 'cc_mime_types');


/**
 * This ensures that Timber is loaded and available as a PHP class.
 * If not, it gives an error message to help direct developers on where to activate
 */

if ( ! class_exists( 'Timber' ) ) {

	add_action(
		'admin_notices',
		function() {
			echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' . esc_url( admin_url( 'plugins.php#timber' ) ) . '">' . esc_url( admin_url( 'plugins.php' ) ) . '</a></p></div>';
		}
	);

	add_filter(
		'template_include',
		function( $template ) {
			return get_stylesheet_directory() . '/no-timber.html';
		}
	);
	return;
}

add_action( 'init', 'full_css' );
function full_css()
{
  setcookie('full-css', true, time() + (86400 * 21), '/');
}

/**
 * Sets the directories (inside your theme) to find .twig files
 */
Timber::$dirname = array( 'templates', 'views' );

/**
 * By default, Timber does NOT autoescape values. Want to enable Twig's autoescape?
 * No prob! Just set this value to true
 */
Timber::$autoescape = false;

/**
 * We're going to configure our theme inside of a subclass of Timber\Site
 * You can move this to its own file and include here via php's include("MySite.php")
 */
class StarterSite extends Timber\Site {
	/** Add timber support. */
	public function __construct() {
		add_action( 'after_setup_theme', array( $this, 'theme_supports' ) );
		add_filter( 'timber/context', array( $this, 'add_to_context' ) );
		add_filter( 'timber/twig', array( $this, 'add_to_twig' ) );
		// add_action( 'init', array( $this, 'register_post_types' ) );
		// add_action( 'init', array( $this, 'register_taxonomies' ) );

		parent::__construct();
	}

	/** This is where you can register custom post types. See ACF */
	public function register_post_types() {
	}

	/** This is where you can register custom taxonomies. See ACF */
	public function register_taxonomies() {
	}

	/** This is where you add some context
	 *
	 * @param string $context context['this'] Being the Twig's {{ this }}.
	 */
	public function add_to_context( $context ) {
		$context['menu']  = new Timber\Menu();
		$context['g'] = get_fields('options');
		$context['site']  = $this;

		// Set your custom variables here

		return $context;
	}

	public function theme_supports() {
		// Add default posts and comments RSS feed links to head.
		add_theme_support( 'automatic-feed-links' );

		/*
		 * Let WordPress manage the document title.
		 * By adding theme support, we declare that this theme does not use a
		 * hard-coded <title> tag in the document head, and expect WordPress to
		 * provide it for us.
		 */
		add_theme_support( 'title-tag' );

		/*
		 * Enable support for Post Thumbnails on posts and pages.
		 *
		 * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
		 */
		// add_theme_support( 'post-thumbnails' );

		/*
		 * Switch default core markup for search form, comment form, and comments
		 * to output valid HTML5.
		 */
		add_theme_support(
			'html5',
			array(
				'comment-form',
				'comment-list',
				'gallery',
				'caption',
			)
		);

		/*
		 * Enable support for Post Formats.
		 *
		 * See: https://codex.wordpress.org/Post_Formats
		 */
		add_theme_support(
			'post-formats',
			array(
				'aside',
				'image',
				'video',
				'quote',
				'link',
				'gallery',
				'audio',
			)
		);

		add_theme_support( 'menus' );
	}

	/** This Would return 'foo bar!'.
	 *
	 * @param string $text being 'foo', then returned 'foo bar!'.
	 */
	public function myfoo( $text ) {
		$text .= ' bar!';
		return $text;
	}

	/** This is where you can add your own functions to twig.
	 *
	 * @param string $twig get extension.
	 */
	public function add_to_twig( $twig ) {
		$twig->addExtension( new Twig\Extension\StringLoaderExtension() );
		$twig->addFilter( new Twig\TwigFilter( 'myfoo', array( $this, 'myfoo' ) ) );
		return $twig;
	}

}

new StarterSite();
