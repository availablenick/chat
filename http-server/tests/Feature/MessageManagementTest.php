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
        Event::fake();
        Storage::fake();
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $file = UploadedFile::fake()->create("test_content.txt");
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

    public function test_message_of_video_type_can_be_created()
    {
        Event::fake();
        Storage::fake();
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $file = UploadedFile::fake()->create("test_content.mp4");
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("messages.store"), [
                "content" => $file,
                "type" => Message::VIDEO_TYPE,
            ]);

        $response2->assertNoContent();
        $this->assertDatabaseHas("messages", [
            "type" => Message::VIDEO_TYPE,
        ]);

        $message = Message::where("type", Message::VIDEO_TYPE)->first();
        Storage::disk()->assertExists($message->content);
        Event::assertDispatched(MessageSent::class);
        Event::assertListening(MessageSent::class, SendMessageNotification::class);
    }

    public function test_message_of_video_type_cannot_be_created_with_wrong_mime_type()
    {
        Event::fake();
        Storage::fake();
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $file = UploadedFile::fake()->create("test_content.txt");
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("messages.store"), [
                "content" => $file,
                "type" => Message::VIDEO_TYPE,
            ]);

        $response2->assertUnprocessable();
        $this->assertDatabaseMissing("messages", [
            "type" => Message::VIDEO_TYPE,
        ]);
    }

    public function test_message_cannot_be_created_by_unauthenticated_user()
    {
        Event::fake();
        $response = $this->post(route("messages.store"), [
            "content" => "test_content",
            "type" => Message::TEXT_TYPE,
        ]);

        $response->assertUnauthorized();
    }

    public function test_message_cannot_be_created_with_expired_session()
    {
        Event::fake();
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $this->travel(Session::LIFETIME)->minutes();
        $session = Session::where("username", "test_username")->first();
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("messages.store"), [
                "content" => "test_content",
                "type" => Message::TEXT_TYPE,
            ]);

        $response2->assertUnauthorized();
        $response2->assertCookieExpired("session");
        $this->assertDeleted($session);
    }

    public function test_message_cannot_be_created_without_content()
    {
        Event::fake();
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
        Event::fake();
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
