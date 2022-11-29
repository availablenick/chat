<?php

namespace App\Listeners;

use App\Models\Message;
use App\Events\PrivateMessageSent;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Queue\InteractsWithQueue;

class SendPrivateMessageNotification
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
     * @param  \App\Events\PrivateMessageSent  $event
     * @return void
     */
    public function handle(PrivateMessageSent $event)
    {
        $data = [
            "author" => $event->message->author,
            "type" => $event->message->type,
            "room" => $event->message->room,
        ];

        switch ($event->message->type) {
            case "text":
                $data["content"] = $event->message->content;
                Http::post("http://ws-server:3000/private-messages", $data);
                break;
            case "image":
            case "video":
                $data["content"] = asset("storage/" . $event->message->content);
                Http::post("http://ws-server:3000/private-messages", $data);
                break;
        }
    }
}
