<?php
/**
 * GO : Grow Online's theme - based on Timber starter theme
 * https://github.com/timber/starter-theme
 *
 * @package  WordPress
 * @subpackage  Timber
 * @since   Timber 0.1
 */


require_once( __DIR__ . '/vendor/autoload.php' );



//////////////////////
///// ACF BLOCKS /////
//////////////////////

function register_acf_blocks() {
	// General blocks
	$acf_blocks = array(
		'heading-fp',
		'cta',
		'content-media',
		'card-list',
		'actualities',
		'solo-content',
		'solo-media',
	);
	foreach($acf_blocks as $acf_block_name) {
		register_block_type( __DIR__ . '/acf-blocks/' . $acf_block_name );
	}

	// Template parts
	$acf_blocks = array(
		'footer',
		'header',
	);
	foreach($acf_blocks as $acf_block_name) {
		register_block_type( __DIR__ . '/acf-blocks/tpl-parts/' . $acf_block_name );
	}

}
add_action( 'init', 'register_acf_blocks' );




/////////////////////////////////////
///// THEME OVERIDE & FUNCTIONS /////
/////////////////////////////////////

// Easily get an archive link
function get_archive_link($slug) {
	return get_post_type_archive_link($slug);
}

// Add custom color palette in Block editor.
function custom_gutenberg_color_palette() {
	add_theme_support(
		'editor-color-palette', array(
			array(
				'name'  => esc_html__( 'Yellow', 'acf-admin' ),
				'slug' => 'light',
				'color' => '#f1f1f1',
			),
			array(
				'name'  => esc_html__( 'Special', 'acf-admin' ),
				'slug' => 'pretty',
				'color' => 'radial-gradient(rgba(0, 0, 0, 0.05) 4.5px, transparent 4.5px), radial-gradient(rgba(0, 0, 0, 0.05) 4.5px, transparent 4.5px);',
			)
		)
	);
}
add_action( 'after_setup_theme', 'custom_gutenberg_color_palette' );


// Add "reusable" block section in menu
function add_reusable_blocks_admin_menu() {
    add_menu_page( __('Reusable Blocks', 'Non-editable strings'), __('Reusable Blocks', 'Non-editable strings'), 'edit_posts', 'edit.php?post_type=wp_block', '', 'dashicons-editor-table', 22 );
}
add_action( 'admin_menu', 'add_reusable_blocks_admin_menu' );


// Get svg code of an svg file
function get_svg($media_file) {

	$html = "";

	if ($media_file) {
		if ($media_file['mime_type'] != "image/svg+xml" && is_user_logged_in()) {
			$html = '<p style="color: red;">Attached file is not an ".svg" file. Please select an ".svg" file.</p>';
		}else if ($media_file['mime_type'] == "image/svg+xml") {
			$html = file_get_contents($media_file['url']);
		}
	}else if (!$media_file && is_user_logged_in()) {
		$html = "<p class='admin-msg'>No file attached.</p>";
	}

    return $html;
}


// String replacement shortcodes (mostly for legal pages)
function phone_shortcode($atts) {
	$text = get_field('phone', 'option');
	$text_fallback = $text ? $text : "";
    return $text_fallback;
}
add_shortcode('phone', 'phone_shortcode');

function email_shortcode($atts) {
	$text = get_field('email', 'option');
	$text_fallback = $text ? $text : "";
    return $text_fallback;
}
add_shortcode('email', 'email_shortcode');

function address_shortcode($atts) {
	$text = get_field('address', 'option');
	$text_fallback = $text ? $text : "";
    return $text_fallback;
}
add_shortcode('address', 'address_shortcode');

function company_shortcode($atts) {
	$text = get_field('name', 'option');
	$text_fallback = $text ? $text : "";
    return $text_fallback;
}
add_shortcode('company', 'company_shortcode');


// Add footer reusable block in each pages
function insert_footer_acf_block() {
    $block_id = 269;
    $block_content = get_post($block_id)->post_content;
	$parsed_blocks = parse_blocks( $block_content );

	if ( $parsed_blocks ) {
		foreach ( $parsed_blocks as $block ) {
			echo render_block( $block );
		}
	}
}

function insert_header_acf_block() {
    $block_id = 321;
    $block_content = get_post($block_id)->post_content;
	$parsed_blocks = parse_blocks( $block_content );

	if ( $parsed_blocks ) {
		foreach ( $parsed_blocks as $block ) {
			echo render_block( $block );
		}
	}
}



// Allow svg files in media
function cc_mime_types($mimes) {
	$mimes['svg'] = 'image/svg+xml';
	return $mimes;
}
add_filter('upload_mimes', 'cc_mime_types');


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

function remove_large_image_sizes() {
	remove_image_size( '1536x1536' );             // 2 x Medium Large (1536 x 1536)
	remove_image_size( '2048x2048' );             // 2 x Large (2048 x 2048)
}
add_action( 'init', 'remove_large_image_sizes' );



/////////////////////////
///// FRONT SCRIPTS /////
/////////////////////////

// Scripts & APIs
function my_theme_scripts() {
	// wp_enqueue_script( 'lightbox', get_template_directory_uri() . '/assets/js/api/lightbox.js', array( 'jquery' ), null, true );
	wp_enqueue_script( 'bxslider', get_template_directory_uri() . '/assets/js/api/bxslider.js', array( 'jquery' ), null, true );
	wp_enqueue_script( 'script', get_template_directory_uri() . '/assets/js/app.js', array( 'jquery' ), null, true );
}
add_action( 'wp_enqueue_scripts', 'my_theme_scripts' );



///////////////////////////
///////// ADMIN ///////////
///////////////////////////


// Admin Wordpress customisation
function custom_login_logo() {
	$logo = !empty(get_field('logo_solo', 'option')) ? get_field('logo_solo', 'option') : get_field('logo', 'option');
    echo '<style type="text/css">
        .login h1 a {
            background-image: url(' . $logo['url'] . ') !important;
            background-size: contain !important;
            width: 100% !important;
        }
    </style>';
}

add_action('login_head', 'custom_login_logo');


// Admin styles
function admin_styles() {
    wp_enqueue_style( 'admin-css', get_template_directory_uri() . '/assets/css/admin-style.css' );

	// If user is editor, limit ui
	if (!current_user_can('administrator')) {
		wp_enqueue_style( 'wp-editor-ui', get_template_directory_uri() . '/assets/css/wp-editor-ui.css' );
	}
}
add_action( 'admin_enqueue_scripts', 'admin_styles' );

// Script de l'administration - disactivated
// ACF blocks's fields are loaded dynamically - update accordions's names is then not working 
function acf_admin_enqueue_script($hook) {
    if ('post.php' !== $hook) {
        return;
    }
    wp_enqueue_script('admin-js',  get_template_directory_uri() . '/assets/js/admin.js' );
}

// add_action('admin_enqueue_scripts', 'acf_admin_enqueue_script');







//////////////////
///// TIMBER /////
//////////////////

/**
 * This ensures that Timber is loaded and available as a PHP class.
 * If not, it gives an error message to help direct developers on where to activate
 */

$timber = new Timber\Timber();

if ( ! class_exists( 'Timber' ) ) {

	add_action(
		'admin_notices',
		function() {
			echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' . esc_url( admin_url( 'plugins.php#timber' ) ) . '">' . esc_url( admin_url( 'plugins.php' ) ) . '</a></p></div>';
		}
	);


	// Message if Timber is not installed
	add_filter(
		'template_include',
		function( $template ) {
			return get_stylesheet_directory() . '/assets/static/no-timber.html';
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
Timber::$dirname = array( 'twig', 'views' );

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

		parent::__construct();
	}

	/** This is where you add some context
	 *
	 * @param string $context context['this'] Being the Twig's {{ this }}.
	 */
	public function add_to_context( $context ) {
		$context['menu']  = new Timber\Menu();
		$context['g'] = get_fields('options');
		$context['site']  = $this;
		
		$footer_pt = get_field('f_last_col') ? get_field('f_last_col')['col_type'] : null;
		if($footer_pt != 'contact') {
			$context['footer_post_type'] = Timber::get_posts( array(
				'post_type' => $footer_pt,
				'posts_per_page' => 5,
			));
		}

		return $context;
	}

	public function theme_supports() {
		// Add default posts and comments RSS feed links to head.
		add_theme_support( 'automatic-feed-links' );
		
		// Add thumnail support for posts
		// add_theme_support('post-thumbnails');

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
		 * 
		 * add_theme_support( 'post-thumbnails' );
		 */

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

		// Get svg for svg files
		$twig->addFunction( new Timber\Twig_Function( 'get_svg', 'get_svg' ) );

		// Easily get an archive link
		$twig->addFunction( new Timber\Twig_Function( 'get_archive_link', 'get_archive_link' ) );
		
		return $twig;
	}

}

new StarterSite();
