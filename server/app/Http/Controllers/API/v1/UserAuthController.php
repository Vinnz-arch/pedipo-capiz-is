<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class UserAuthController extends Controller
{
    /**
     * Handle user portal login.
     */
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
            \Log::info('User reCAPTCHA verification bypassed (Local/Dev environment).');
        } else {
            // Production or Local with keys configured: Perform strict verification
            if (empty($secretKey)) {
                \Log::critical('User reCAPTCHA configuration error: Secret Key is missing in a non-local environment.');
                
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
                    \Log::warning('User reCAPTCHA verification failed', [
                        'response' => $responseData,
                        'ip' => $request->ip()
                    ]);

                    throw ValidationException::withMessages([
                        'recaptcha_token' => ['The CAPTCHA verification failed. Please try again.'],
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('User reCAPTCHA connection error: ' . $e->getMessage());
                throw ValidationException::withMessages([
                    'recaptcha_token' => ['Unable to connect to security verification service. Please try again later.'],
                ]);
            }
        }

        // 3. Find the user by email
        $user = User::where('email', $request->email)->first();

        // 3. Securely check the password
        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials for the Portal are incorrect.'],
            ]);
        }

        // 4. Generate a secure token for this user
        $token = $user->createToken('user_auth_token')->plainTextToken;

        // Create log entry
        UserLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // 5. Return the token and user/client info
        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
            'client' => $user // for frontend compatibility
        ]);
    }

    /**
     * Log out the user and revoke the token.
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        
        // 1. Ensure the user is actually a User
        if ($user instanceof \App\Models\User) {
            UserLog::create([
                'user_id' => $user->id,
                'action' => 'logout',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Revoke the token that was used to authenticate the current request
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Successfully logged out from Portal'
        ]);
    }
}
