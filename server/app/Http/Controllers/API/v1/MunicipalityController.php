<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Municipality;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MunicipalityController extends Controller
{
    /**
     * Display a listing of municipalities.
     */
    public function index(): JsonResponse
    {
        $municipalities = Municipality::orderBy('name', 'asc')->get();

        return response()->json([
            'municipalities' => $municipalities,
        ]);
    }

    /**
     * Store a newly created municipality in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $rules = [
            'name' => 'required|string|unique:municipalities,name|max:255',
            'class' => 'required|string|max:255',
            'population' => 'required|integer|min:0',
            'land_area' => 'required|numeric|min:0',
            'barangay_count' => 'required|integer|min:0',
            'gdp' => 'required|numeric|min:0',
            'key_industries' => 'nullable|string',
            'description' => 'nullable|string',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'website_url' => 'nullable|url|max:255',
        ];

        if ($request->hasFile('seal')) {
            $rules['seal'] = 'image|max:5120'; // max 5MB
        }

        $validated = $request->validate($rules);

        $sealPath = null;
        if ($request->hasFile('seal')) {
            $path = $request->file('seal')->store('seals', 'public');
            $sealPath = '/storage/' . $path;
        }

        $municipality = Municipality::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'class' => $validated['class'],
            'population' => $validated['population'],
            'land_area' => $validated['land_area'],
            'barangay_count' => $validated['barangay_count'],
            'gdp' => $validated['gdp'],
            'key_industries' => $validated['key_industries'] ?? null,
            'description' => $validated['description'] ?? null,
            'seal_path' => $sealPath,
            'contact_email' => $validated['contact_email'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'website_url' => $validated['website_url'] ?? null,
        ]);

        return response()->json([
            'message' => 'Municipality created successfully.',
            'municipality' => $municipality,
        ], 201);
    }

    /**
     * Display the specified municipality.
     */
    public function show(Municipality $municipality): JsonResponse
    {
        return response()->json($municipality);
    }

    /**
     * Update the specified municipality in storage.
     */
    public function update(Request $request, Municipality $municipality): JsonResponse
    {
        $rules = [
            'name' => 'required|string|max:255|unique:municipalities,name,' . $municipality->id,
            'class' => 'required|string|max:255',
            'population' => 'required|integer|min:0',
            'land_area' => 'required|numeric|min:0',
            'barangay_count' => 'required|integer|min:0',
            'gdp' => 'required|numeric|min:0',
            'key_industries' => 'nullable|string',
            'description' => 'nullable|string',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'website_url' => 'nullable|url|max:255',
        ];

        if ($request->hasFile('seal')) {
            $rules['seal'] = 'image|max:5120';
        }

        $validated = $request->validate($rules);

        $sealPath = $municipality->seal_path;
        if ($request->hasFile('seal')) {
            // Delete old seal if exists
            if ($municipality->seal_path) {
                $oldPath = str_replace('/storage/', '', $municipality->seal_path);
                Storage::disk('public')->delete($oldPath);
            }
            
            $path = $request->file('seal')->store('seals', 'public');
            $sealPath = '/storage/' . $path;
        }

        $municipality->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'class' => $validated['class'],
            'population' => $validated['population'],
            'land_area' => $validated['land_area'],
            'barangay_count' => $validated['barangay_count'],
            'gdp' => $validated['gdp'],
            'key_industries' => $validated['key_industries'] ?? null,
            'description' => $validated['description'] ?? null,
            'seal_path' => $sealPath,
            'contact_email' => $validated['contact_email'] ?? null,
            'contact_phone' => $validated['contact_phone'] ?? null,
            'website_url' => $validated['website_url'] ?? null,
        ]);

        return response()->json([
            'message' => 'Municipality updated successfully.',
            'municipality' => $municipality,
        ]);
    }

    /**
     * Remove the specified municipality from storage.
     */
    public function destroy(Municipality $municipality): JsonResponse
    {
        if ($municipality->seal_path) {
            $oldPath = str_replace('/storage/', '', $municipality->seal_path);
            Storage::disk('public')->delete($oldPath);
        }

        $municipality->delete();

        return response()->json([
            'message' => 'Municipality deleted successfully.',
        ]);
    }
}
