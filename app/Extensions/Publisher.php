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
     * @param array  $data
     * @param string $source
     *
     * @throws \Throwable
     */
    public function publish(array $data, string $source = 'http')
    {
        $topic = throw_unless($data['topic'] ?? false, new Exception('Topic must be given'));
        $isPrivate = ($data['publish_type'] ?? 'private') === 'private';
        $type = $data['type'] ?? null;

        $message = json_encode(
            [
                'time'    => now()->toDateTimeString(),
                'source'  => $source,
                'topic'   => $topic,
                'type'    => $type,
                'private' => $isPrivate,
                'message' => $data['message'] ?? 'empty message is received',
            ]
        );

        return call_user_func_array($this->mercure, [new Update($topic, $message, $isPrivate, null, $type)]);
    }
}
