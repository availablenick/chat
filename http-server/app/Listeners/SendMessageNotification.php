<?php

namespace App\Listeners;

use App\Events\MessageSent;
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
        $data = [
            "author" => $event->message->author,
            "type" => $event->message->type,
            "room" => $event->message->room,
        ];

        switch ($event->message->type) {
            case "text":
                $data["content"] = $event->message->content;
                Http::post("http://ws-server:3000/messages", $data);
                break;
            case "image":
            case "video":
                $data["content"] = asset("storage/" . $event->message->content);
                Http::post("http://ws-server:3000/messages", $data);
                break;
        }
    }
}
