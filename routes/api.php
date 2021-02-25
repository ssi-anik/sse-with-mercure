<?php

use Firebase\JWT\JWT;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Symfony\Component\Mercure\Publisher;
use Symfony\Component\Mercure\Update;

Route::post(
    'broadcast',
    function (Request $request, Publisher $publisher) {
        $message = $request->input('message', 'empty message is received');
        $topic = throw_unless($request->input('topic'), new Exception('Topic must be given'));
        $isPrivate = $request->input('publish_type') === 'private';
        $type = $request->input('type');
        $publisher(new Update($topic, $message, $isPrivate, null, $type));

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
