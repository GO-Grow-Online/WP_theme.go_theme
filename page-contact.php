<?php
/* Template Name: Contact */

$context = Timber::context();

$timber_post     = new Timber\Post();
$context['p'] = $timber_post;
Timber::render( 'page-contact.twig' , $context );
