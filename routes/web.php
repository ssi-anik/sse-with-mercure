<?php

use Illuminate\Support\Facades\Route;
use Symfony\Component\Mercure\Publisher;
use Symfony\Component\Mercure\Update;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    cookie()->queue(
        'mercureAuthorization',
        env('MERCURE_SUBSCRIBER_JWT_KEY'),
        60,
        '/.well-known/mercure',
        null,
        false,
        false,
        false,
        'strict'
    );
    return view('main');
});

Route::get('data', function (Publisher $publisher) {
    dd($publisher(new Update('http://example.com/books/1', json_encode(['value' => 'is given here']), true)));
});
