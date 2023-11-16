<?php
$context = Timber::context();

$context['b_prop'] = $block;
$context['b'] = get_fields();
$context['is_preview'] = $is_preview;

$context['b']['actualities'] = Timber::get_posts( array(
    'post_type' => 'post',
    'posts_per_page' => 3,
));

Timber::render( 'twig/acf-blocks/actualities.twig', $context );