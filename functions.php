<?php
/**
 * Timber starter-theme
 * https://github.com/timber/starter-theme
 */

// Load Composer dependencies.
require_once __DIR__ . '/vendor/autoload.php';


//////////////////////
///// ACF BLOCKS /////
//////////////////////

// By default, block's styles and scripts are all loaded wether or not the block is loaded.
// This line load scripts and styles ONLY if the block is used on the page.
add_filter( 'should_load_separate_core_block_assets', '__return_true' );

// Register blocks
function register_acf_blocks() {
	// General blocks
	$acf_blocks = array(
		'heading_fp',
		'cta',
		'menu_slider',
		'partners',
		'content_media',
		'card_list',
		// 'actualities',
		// 'solo_content',
		// 'solo_media',
	);
	foreach($acf_blocks as $acf_block_name) {
		register_block_type( __DIR__ . '/assets/acf-blocks/' . $acf_block_name );
	}

	// Template parts
	$acf_blocks = array(
		'footer',
		'header',
	);
	foreach($acf_blocks as $acf_block_name) {
		register_block_type( __DIR__ . '/assets/acf-blocks/tpl-parts/' . $acf_block_name );
	}

}
add_action( 'init', 'register_acf_blocks' );


// Add footer reusable block in each front-end pages
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


/////////////////////
///// FUNCTIONS /////
/////////////////////

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
				'name'  => esc_html__( 'Illustration top', 'acf-admin' ),
				'slug' => 'illu-top',
				'color' => 'linear-gradient(to bottom, #000 0%, #000 50%, transparent 50.1%, transparent 100%)',
			),
			array(
				'name'  => esc_html__( 'Illustration bottom', 'acf-admin' ),
				'slug' => 'illu-bottom',
				'color' => 'linear-gradient(to top, #000 0%, #000 50%, transparent 50.1%, transparent 100%)',
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




//////////////////////
///// SHORTCODES /////
//////////////////////


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




//////////////////////////////////
///// THEME FUNCTIONNALITIES /////
//////////////////////////////////


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
// add_image_size( 'card-thumbnail', 550, 550, false );


// Remove unused image sizes
add_filter('intermediate_image_sizes', function($sizes) {
  return array_diff($sizes, ['medium_large']);  // Medium Large (768 x 0)
  return array_diff($sizes, ['full']);  // Medium Large (768 x 0)
});

function remove_large_image_sizes() {
	remove_image_size( '1536x1536' );  // 2 x Medium Large (1536 x 1536)
	remove_image_size( '2048x2048' );  // 2 x Large (2048 x 2048)
}
add_action( 'init', 'remove_large_image_sizes' );


// Scale original image to limit hosting weight
function redimensionner_image_originale($image_id) {

    $image_path = get_attached_file($image_id);
    $max_width = 2400;
    $resized = wp_get_image_editor($image_path);

    if (!is_wp_error($resized)) {
        $resized->resize($max_width, 0); // Resize while keeping proportions
        $resized->save($image_path);
    }
}
add_action('add_attachment', 'redimensionner_image_originale');




/////////////////////////
///// FRONT SCRIPTS /////
/////////////////////////

function my_theme_scripts() {
	// wp_enqueue_script( 'lightbox', get_template_directory_uri() . '/assets/js/api/lightbox.js', array( 'jquery' ), null, true );
	wp_enqueue_script( 'bxslider', get_template_directory_uri() . '/assets/js/api/bxslider.js', array( 'jquery' ), null, true );
	wp_enqueue_script( 'script', get_template_directory_uri() . '/assets/js/app.js', array( 'jquery' ), null, true );
	wp_script_add_data( 'script', 'defer', true );
}

add_action( 'wp_enqueue_scripts', 'my_theme_scripts' );

  



///////////////////////////////////////////////////
///////// ADMIN CUSTOMIZATION & SCRIPTS ///////////
///////////////////////////////////////////////////

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
	if (!current_user_can('administrator')) {
		wp_enqueue_style( 'wp-editor-ui', get_template_directory_uri() . '/assets/css/wp-editor-ui.css' );
	} 
}
add_action( 'admin_enqueue_scripts', 'admin_styles' );


// Gutenberg styles & scripts
function gutenberg_assets() {
	// Load general styles and scripts
	my_theme_scripts();
	
    wp_enqueue_style( 'admin-css', get_template_directory_uri() . '/assets/css/admin-style.css' );
}
add_action( 'enqueue_block_assets', 'gutenberg_assets' );




///////////////////////
///// INIT TIMBER /////
///////////////////////

use Timber\Site;

class StarterSite extends Site {
	public function __construct() {
		add_action( 'after_setup_theme', array( $this, 'theme_supports' ) );

		add_filter( 'timber/context', array( $this, 'add_to_context' ) );
		add_filter( 'timber/twig', array( $this, 'add_to_twig' ) );
		add_filter( 'timber/twig/environment/options', [ $this, 'update_twig_environment_options' ] );

		parent::__construct();
	}

	/**
	 * This is where you add some context
	 *
	 * @param string $context context['this'] Being the Twig's {{ this }}.
	 */
	public function add_to_context( $context ) {
		$context['menu']  = Timber::get_menu();
		$context['g'] = get_fields('options');
		$context['site']  = $this;

        // Footer latest news
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
		add_theme_support( 'post-thumbnails' );

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

	/**
	 * his would return 'foo bar!'.
	 *
	 * @param string $text being 'foo', then returned 'foo bar!'.
	 */
	public function myfoo( $text ) {
		$text .= ' bar!';
		return $text;
	}

	/**
	 * This is where you can add your own functions to twig.
	 *
	 * @param Twig\Environment $twig get extension.
	 */
	public function add_to_twig( $twig ) {
		/**
		 * Required when you want to use Twig’s template_from_string.
		 * @link https://twig.symfony.com/doc/3.x/functions/template_from_string.html
		 */
		// $twig->addExtension( new Twig\Extension\StringLoaderExtension() );

		$twig->addFilter( new Twig\TwigFilter( 'myfoo', [ $this, 'myfoo' ] ) );

		// Get svg for svg files
		$twig->addFunction( new Twig\TwigFunction( 'get_svg', 'get_svg' ) );

		// Easily get an archive link
		$twig->addFunction( new Twig\TwigFunction( 'get_archive_link', 'get_archive_link' ) );
		

		return $twig;
	}

	/**
	 * Updates Twig environment options.
	 *
	 * @link https://twig.symfony.com/doc/2.x/api.html#environment-options
	 *
	 * \@param array $options An array of environment options.
	 *
	 * @return array
	 */
	function update_twig_environment_options( $options ) {
	    // $options['autoescape'] = true;

	    return $options;
	}
}
Timber\Timber::init();

// Sets the directories (inside your theme) to find .twig files.
Timber::$dirname = [ 'twig' ];

new StarterSite();
