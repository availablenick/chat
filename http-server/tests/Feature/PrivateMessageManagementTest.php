<?php

namespace Tests\Feature;

use App\Events\PrivateMessageSent;
use App\Listeners\SendPrivateMessageNotification;
use App\Models\Session;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PrivateMessageManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_private_message_of_text_type_can_be_sent()
    {
        Event::fake();
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username1",
        ]);

        $session = Session::where("username", "test_username1")->first();
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("private-messages.store"), [
                "content" => "test_content",
                "type" => "text",
                "room" => "test_room",
            ]);

        $response2->assertNoContent();
        Event::assertDispatched(PrivateMessageSent::class);
        Event::assertListening(
            PrivateMessageSent::class,
            SendPrivateMessageNotification::class
        );
    }

    public function test_private_message_of_image_type_can_be_sent()
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
            ->post(route("private-messages.store"), [
                "content" => $file,
                "type" => "image",
                "room" => "test_room",
            ]);

        $response2->assertNoContent();
        Storage::disk()->assertExists("public/images/" . $file->hashName());
        Event::assertDispatched(PrivateMessageSent::class);
        Event::assertListening(
            PrivateMessageSent::class,
            SendPrivateMessageNotification::class
        );
    }

    public function test_private_message_of_image_type_cannot_be_sent_with_wrong_mime_type()
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
            ->post(route("private-messages.store"), [
                "content" => $file,
                "type" => "image",
                "room" => "test_room",
            ]);

        $response2->assertUnprocessable();
    }

    public function test_private_message_of_video_type_can_be_sent()
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
            ->post(route("private-messages.store"), [
                "content" => $file,
                "type" => "video",
                "room" => "test_room",
            ]);

        $response2->assertNoContent();
        Storage::disk()->assertExists("public/videos/" . $file->hashName());
        Event::assertDispatched(PrivateMessageSent::class);
        Event::assertListening(
            PrivateMessageSent::class,
            SendPrivateMessageNotification::class
        );
    }

    public function test_private_message_of_video_type_cannot_be_sent_with_wrong_mime_type()
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
            ->post(route("private-messages.store"), [
                "content" => $file,
                "type" => "video",
                "room" => "test_room",
            ]);

        $response2->assertUnprocessable();
    }

    public function test_private_message_cannot_be_sent_by_unauthenticated_user()
    {
        Event::fake();
        $response = $this->post(route("private-messages.store"), [
            "content" => "test_content",
            "type" => "text",
            "room" => "test_room",
        ]);

        $response->assertUnauthorized();
    }

    public function test_private_message_cannot_be_sent_with_expired_session()
    {
        Event::fake();
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $this->travel(Session::LIFETIME)->minutes();
        $session = Session::where("username", "test_username")->first();
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("private-messages.store"), [
                "content" => "test_content",
                "type" => "text",
                "room" => "test_room",
            ]);

        $response2->assertUnauthorized();
        $response2->assertCookieExpired("session");
        $this->assertDeleted($session);
    }

    public function test_private_message_cannot_be_sent_without_content()
    {
        Event::fake();
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("private-messages.store"));

        $response2->assertInvalid("content");
    }

    public function test_private_message_cannot_be_sent_without_type()
    {
        Event::fake();
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("private-messages.store"));

        $response2->assertInvalid("type");
    }

    public function test_private_message_cannot_be_sent_without_room()
    {
        Event::fake();
        $response1 = $this->post(route("users.select"), [
            "username" => "test_username",
        ]);

        $session = Session::where("username", "test_username")->first();
        $response2 = $this
            ->withCookie("session", $session->session_id)
            ->post(route("private-messages.store"));

        $response2->assertInvalid("room");
    }
}
