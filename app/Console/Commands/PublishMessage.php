<?php

namespace App\Console\Commands;

use App\Extensions\Publisher;
use Illuminate\Console\Command;

class PublishMessage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'publish:message {topic} {--type=} {--private}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish message to mercure';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @param \App\Extensions\Publisher $publisher
     *
     * @return int
     */
    public function handle(Publisher $publisher)
    {
        $topic = trim($this->argument('topic'));
        $topics = array_filter(
            array_map(
                function ($item) {
                    return trim($item);
                },
                explode(',', $topic)
            )
        );
        $publishType = $this->option('private') ? 'private' : 'public';
        $type = $this->option('type');
        $type = $type ? trim($type) : null;
        do {
            $message = $this->ask('Write your message here');
        } while (!$message);
        $this->output->info(
            sprintf(
                "Above message will be sent message to topic(s): '%s' and type: '%s' and as %s",
                implode(', ', $topics),
                $type ?? "",
                $publishType
            )
        );
        $publisher->publish(
            [
                'topic'        => $topics,
                'type'         => $type,
                'publish_type' => $publishType,
                'message'      => $message,
            ],
            'artisan'
        );
    }
}
