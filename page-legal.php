<?php
/* Template Name: Legal pages */

$context = Timber::context();

$timber_post     = new Timber\Post();
$context['p'] = $timber_post;
Timber::render( 'page-legal.twig' , $context );