<?php
/* Template Name: Wysiwyg editor */

$context = Timber::context();

$timber_post     = new Timber\Post();
$context['p'] = $timber_post;
Timber::render( 'page-editor.twig' , $context );
