<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\LandingPageSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LandingPageController extends Controller
{
    /**
     * Get the landing page settings.
     */
    public function getSettings(): JsonResponse
    {
        $settings = LandingPageSetting::first();
        
        if (!$settings) {
            return response()->json([
                'message' => 'No settings found.',
                'settings' => null
            ], 404);
        }

        return response()->json([
            'settings' => $settings
        ]);
    }

    /**
     * Update the landing page settings.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hero_badge' => 'required|string|max:255',
            'hero_title' => 'required|string|max:255',
            'hero_subtitle' => 'required|string|max:1000',
            'hero_description' => 'required|string',
            'vision_text' => 'required|string',
            'mission_point_1' => 'required|string',
            'mission_point_2' => 'required|string',
            'mission_point_3' => 'required|string',
            'msme_title' => 'required|string|max:255',
            'msme_description' => 'required|string',
            'mandate_text' => 'required|string',
            'service_pledge_1' => 'required|string',
            'service_pledge_2' => 'required|string',
            'service_pledge_3' => 'required|string',
            'service_pledge_4' => 'required|string',
            'contact_address' => 'required|string|max:255',
            'contact_email' => 'required|string|email|max:255',
            'contact_phone' => 'required|string|max:255',
            'contact_facebook' => 'nullable|string|max:255',
            'contact_twitter' => 'nullable|string|max:255',
            'contact_linkedin' => 'nullable|string|max:255',
            'division_1_title' => 'required|string|max:255',
            'division_1_subtitle' => 'required|string|max:255',
            'division_1_bullets' => 'required|string',
            'division_2_title' => 'required|string|max:255',
            'division_2_subtitle' => 'required|string|max:255',
            'division_2_bullets' => 'required|string',
            'division_3_title' => 'required|string|max:255',
            'division_3_subtitle' => 'required|string|max:255',
            'division_3_bullets' => 'required|string',
        ]);

        $settings = LandingPageSetting::first();
        if (!$settings) {
            $settings = new LandingPageSetting();
        }

        $settings->fill($validated);
        $settings->save();

        return response()->json([
            'message' => 'Landing page settings updated successfully.',
            'settings' => $settings
        ]);
    }
}
