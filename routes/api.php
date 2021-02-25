<?php

use App\Extensions\Publisher;
use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post(
    'broadcast',
    function (Request $request, Publisher $publisher) {
        $publisher->publish($request->all());

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

Route::post(
    'subscriber-token',
    function (Request $request) {
        $topics = $request->get('topics');
        $topics = array_filter(array_map('trim', explode(',', $topics)));

        if (empty($topics)) {
            return response()->json(['error' => true, 'message' => 'Empty topics to subscribes to'], 422);
        }

        if ((bool)$request->input('anonymous')) {
            $subscriptions = [];
        } else {
            $subscriptions = $topics;
        }

        $payload = [
            'mercure' => ['subscribe' => $subscriptions],
        ];
        if ($ttl = (int)$request->input('ttl')) {
            $payload['exp'] = now()->seconds($ttl)->timestamp;
        }

        return response()->json(
            [
                'error'  => false,
                'topics' => $topics,
                'token'  => JWT::encode($payload, env('MERCURE_SUBSCRIBER_JWT_KEY')),
            ]
        );
    }
);
