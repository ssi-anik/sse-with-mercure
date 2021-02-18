<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\Mercure\Publisher;
use Symfony\Component\Mercure\Update;

Route::post(
    'broadcast',
    function (Request $request, Publisher $publisher) {
        $message = $request->get('message', 'empty message is received');
        $topic = throw_unless($request->get('topic'), new Exception('Topic must be given'));
        $isPrivate = $request->get('publish_type') === 'private';
        $publisher(new Update($topic, $message, $isPrivate, null, 'name'));

        return response()->json(['error' => false, 'message' => 'Message published.'], 202);
    }
);

Route::get(
    'discovery',
    function () {
        $hubUrl = env('MERCURE_HUB_URL', 'http://127.0.0.1:9000');

        return response()->json([])->withHeaders(
            [
                'link' => sprintf('<%s/.well-known/mercure>; rel="mercure"', $hubUrl),
            ]
        );
    }
);
