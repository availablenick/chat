<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\Session;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function store(Request $request)
    {
        $session_id = $request->cookie("session");
        $session = Session::where("session_id", $session_id)->first();
        if ($session === null) {
            abort(401);
        }

        $validated = $request->validate([
            "content" => "required",
            "type" => "required",
        ]);

        $data = [
            "author" => $session->username,
            "type" => $validated["type"],
        ];

        switch ($validated["type"]) {
            case Message::TEXT_TYPE:
                $data["content"] = $validated["content"];
                break;
            case Message::IMAGE_TYPE:
                $file = $request->file("content");
                if (!str_starts_with($file->getMimeType(), "image/")) {
                    abort(422);
                }

                $filepath = $file->store("public/images");
                $data["content"] = $filepath;
                break;
            case Message::VIDEO_TYPE:
                $file = $request->file("content");
                if (!str_starts_with($file->getMimeType(), "video/")) {
                    abort(422);
                }

                $filepath = $file->store("public/videos");
                $data["content"] = $filepath;
                break;
            default:
                return abort(422);
        }

        $message = Message::create($data);
        MessageSent::dispatch($message);
        return response()->noContent();
    }
}
