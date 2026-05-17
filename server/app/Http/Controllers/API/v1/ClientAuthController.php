<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\ClientLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class ClientAuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validate the incoming request
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'recaptcha_token' => 'required|string',
        ]);

        // 2. Verify reCAPTCHA token
        $secretKey = config('services.recaptcha.secret');
        $isLocal = app()->environment('local', 'development');
        
        // Determine if we should bypass verification (Local environment + Missing/Mock key)
        $shouldBypass = $isLocal && (empty($secretKey) || $secretKey === 'mock_secret' || $request->recaptcha_token === 'debug');

        if ($shouldBypass) {
            \Log::info('Client reCAPTCHA verification bypassed (Local/Dev environment).');
        } else {
            // Production or Local with keys configured: Perform strict verification
            if (empty($secretKey)) {
                \Log::critical('reCAPTCHA configuration error: Secret Key is missing in a non-local environment.');
                
                throw ValidationException::withMessages([
                    'recaptcha_token' => ['Server security configuration error. Please contact the administrator.'],
                ]);
            }

            try {
                $response = Http::asForm()->timeout(10)->post('https://www.google.com/recaptcha/api/siteverify', [
                    'secret' => $secretKey,
                    'response' => $request->recaptcha_token,
                    'remoteip' => $request->ip(),
                ]);

                $responseData = $response->json();

                if (!$response->successful() || !($responseData['success'] ?? false)) {
                    \Log::warning('Client reCAPTCHA verification failed', [
                        'response' => $responseData,
                        'ip' => $request->ip()
                    ]);

                    throw ValidationException::withMessages([
                        'recaptcha_token' => ['The CAPTCHA verification failed. Please try again.'],
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('reCAPTCHA connection error: ' . $e->getMessage());
                throw ValidationException::withMessages([
                    'recaptcha_token' => ['Unable to connect to security verification service. Please try again later.'],
                ]);
            }
        }

        // 3. Find the client by email
        $client = Client::where('email', $request->email)->first();

        if (! $client || ! Hash::check($request->password, $client->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials for the Client Portal are incorrect.'],
            ]);
        }

        // 4. Generate a secure token for this client
        $token = $client->createToken('client_auth_token')->plainTextToken;

        // 5. Log the login event
        ClientLog::create([
            'client_id' => $client->id,
            'action' => 'login',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'client' => $client
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        // 1. Ensure the user is actually a Client
        if ($user instanceof \App\Models\Client) {
            ClientLog::create([
                'client_id' => $user->id,
                'action' => 'logout',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        // 2. Revoke the token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out from Client Portal'
        ]);
    }
}
