<?php

namespace Tests\Feature;

use App\Events\MessageSent;
use App\Listeners\SendMessageNotification;
use App\Models\Message;
use App\Models\Session;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MessageManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_message_of_text_type_can_be_created()
    {
        Event::fake();
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("messages.store"), [
                "content" => "test_content",
                "type" => Message::TEXT_TYPE,
            ]);

        $response2->assertNoContent();
        $this->assertDatabaseHas("messages", [
            "content" => "test_content",
            "type" => Message::TEXT_TYPE,
        ]);

        Event::assertDispatched(MessageSent::class);
        Event::assertListening(MessageSent::class, SendMessageNotification::class);
    }

    public function test_message_of_image_type_can_be_created()
    {
        Event::fake();
        Storage::fake();
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $file = UploadedFile::fake()->image("test_content.jpg");
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("messages.store"), [
                "content" => $file,
                "type" => Message::IMAGE_TYPE,
            ]);

        $response2->assertNoContent();
        $this->assertDatabaseHas("messages", [
            "type" => Message::IMAGE_TYPE,
        ]);

        $message = Message::where("type", Message::IMAGE_TYPE)->first();
        Storage::disk()->assertExists($message->content);
        Event::assertDispatched(MessageSent::class);
        Event::assertListening(MessageSent::class, SendMessageNotification::class);
    }

    public function test_message_of_image_type_cannot_be_created_with_wrong_mime_type()
    {
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $file = UploadedFile::fake()->createWithContent("test_content.txt", "test_content");
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("messages.store"), [
                "content" => $file,
                "type" => Message::IMAGE_TYPE,
            ]);

        $response2->assertUnprocessable();
        $this->assertDatabaseMissing("messages", [
            "type" => Message::IMAGE_TYPE,
        ]);
    }

    public function test_message_cannot_be_created_by_unauthenticated_user()
    {
        $response = $this->post(route("messages.store"), [
            "content" => "test_content",
            "type" => Message::TEXT_TYPE,
        ]);

        $response->assertUnauthorized();
    }

    public function test_message_cannot_be_created_without_content()
    {
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("messages.store"));

        $response2->assertInvalid("content");
    }

    public function test_message_cannot_be_created_without_type()
    {
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("messages.store"));

        $response2->assertInvalid("type");
    }
}
