<?php

namespace App\Listeners;

use App\Events\MessageSent;
use App\Models\Message;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Queue\InteractsWithQueue;

class SendMessageNotification
{
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  \App\Events\MessageSent  $event
     * @return void
     */
    public function handle(MessageSent $event)
    {
        switch ($event->message->type) {
            case Message::TEXT_TYPE:
                Http::post("http://ws-server:3000/messages", [
                    "author" => $event->message->author,
                    "content" => $event->message->content,
                    "type" => "text",
                ]);
                break;
            case Message::IMAGE_TYPE:
                Http::attach('content', fopen(storage_path("app/" . $event->message->content), "r"))
                    ->post("http://ws-server:3000/messages", [
                        "author" => $event->message->author,
                        "type" => "image",
                    ]);
                break;
        }
    }
}
