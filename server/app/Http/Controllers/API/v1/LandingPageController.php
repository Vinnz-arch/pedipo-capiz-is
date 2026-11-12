<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\LandingPageSetting;
use App\Support\PublicMedia;
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
            'hero_image_path' => 'nullable|string|max:1000',
            'hero_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'remove_hero_image' => 'nullable|boolean',
            'vision_text' => 'required|string',
            'mission_point_1' => 'required|string',
            'mission_point_2' => 'required|string',
            'mission_point_3' => 'required|string',
            'msme_title' => 'required|string|max:255',
            'msme_description' => 'required|string',
            'msme_image_path' => 'nullable|string|max:1000',
            'msme_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'remove_msme_image' => 'nullable|boolean',
            'mandate_text' => 'required|string',
            'mandate_image_path' => 'nullable|string|max:1000',
            'mandate_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'remove_mandate_image' => 'nullable|boolean',
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

        unset(
            $validated['remove_hero_image'],
            $validated['remove_msme_image'],
            $validated['remove_mandate_image']
        );
        $settings->fill($validated);

        $imageSlots = [
            ['input' => 'hero_image', 'column' => 'hero_image_path', 'prefix' => 'hero_', 'remove' => 'remove_hero_image'],
            ['input' => 'msme_image', 'column' => 'msme_image_path', 'prefix' => 'msme_', 'remove' => 'remove_msme_image'],
            ['input' => 'mandate_image', 'column' => 'mandate_image_path', 'prefix' => 'mandate_', 'remove' => 'remove_mandate_image'],
        ];

        foreach ($imageSlots as $slot) {
            $column = $slot['column'];
            if ($request->hasFile($slot['input'])) {
                PublicMedia::deleteIfLocal($settings->{$column});
                $file = $request->file($slot['input']);
                $fileName = $slot['prefix'] . time() . '.' . $file->getClientOriginalExtension();
                $file->move(public_path('storage/landing'), $fileName);
                $settings->{$column} = '/storage/landing/' . $fileName;
            } elseif ($request->boolean($slot['remove'])) {
                PublicMedia::deleteIfLocal($settings->{$column});
                $settings->{$column} = null;
            }
        }

        $settings->save();

        return response()->json([
            'message' => 'Landing page settings updated successfully.',
            'settings' => $settings
        ]);
    }
}
