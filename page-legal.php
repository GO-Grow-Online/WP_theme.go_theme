<?php
/* Template Name: Legal pages */

$context = Timber::context();

$timber_post     = Timber::get_post();
$context['p'] = $timber_post;
Timber::render( 'page-legal.twig' , $context );