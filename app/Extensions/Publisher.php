<?php

namespace App\Extensions;

use Exception;
use Symfony\Component\Mercure\Publisher as MercurePublisher;
use Symfony\Component\Mercure\Update;

class Publisher
{
    private MercurePublisher $mercure;

    public function __construct(MercurePublisher $mercure)
    {
        $this->mercure = $mercure;
    }

    /**
     * @param array $data
     *
     * @throws \Throwable
     */
    public function publish(array $data, string $source = 'http')
    {
        $message = json_encode(
            [
                'time'    => now()->toDateTimeString(),
                'source'  => $source,
                'message' => $data['message'] ?? 'empty message is received',
            ]
        );

        $topic = throw_unless($data['topic'] ?? false, new Exception('Topic must be given'));
        $isPrivate = ($data['publish_type'] ?? 'private') === 'private';
        $type = $data['type'] ?? null;
        call_user_func_array($this->mercure, [new Update($topic, $message, $isPrivate, null, $type)]);
    }
}
