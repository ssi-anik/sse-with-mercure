<?php

use Illuminate\Support\Facades\Route;

Route::get(
    '/',
    function () {
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
    }
);
