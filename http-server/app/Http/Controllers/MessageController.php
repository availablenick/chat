<?php

namespace App\Http\Controllers;

use App\Models\Session;
use App\Events\MessageSent;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request)
    {
        $session_id = $request->cookie("session");
        $session = Session::where("session_id", $session_id)->first();
        if ($session === null || !$session->isActive()) {
            if ($session !== null) {
                $session->delete();
                return response()->make([], 401)->withoutCookie("session");
            }

            abort(401);
        }

        $validated = $request->validate([
            "content" => "required",
            "type" => "required",
            "room" => "nullable",
        ]);

        $message = (object) [
            "author" => $session->username,
            "type" => $request->type,
            "room" => $request->room,
        ];

        switch ($validated["type"]) {
            case "text":
                $message->content = $validated["content"];
                break;
            case "image":
                $file = $request->file("content");
                if (!str_starts_with($file->getMimeType(), "image/")) {
                    abort(422);
                }

                $filepath = $file->store("public/images");
                $message->content = str_replace("public/", "", $filepath);
                break;
            case "video":
                $file = $request->file("content");
                if (!str_starts_with($file->getMimeType(), "video/")) {
                    abort(422);
                }

                $filepath = $file->store("public/videos");
                $message->content = str_replace("public/", "", $filepath);
                break;
            default:
                return abort(422);
        }

        MessageSent::dispatch($message);
        $session->update(["expiration_date" => now()->addMinutes(Session::LIFETIME)->toDateTimeString()]);
        return response()->noContent()->cookie("session", $session_id, Session::LIFETIME);
    }
}
