<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Opportunity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OpportunityController extends Controller
{
    /**
     * Display a listing of opportunities and categories.
     */
    public function index(): JsonResponse
    {
        $opportunities = Opportunity::with('category')->latest()->get();
        $categories = Category::all();

        return response()->json([
            'opportunities' => $opportunities,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created opportunity in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $rules = [
            'project_name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'roi_estimate' => 'nullable|numeric',
            'land_area' => 'nullable|numeric',
            'incentive_package' => 'nullable|string',
            'status' => 'nullable|string|in:Draft,Published,Closed',
        ];

        if ($request->hasFile('image')) {
            $rules['image'] = 'image|max:5120';
        }

        $validated = $request->validate($rules);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('opportunities', 'public');
            $imagePath = '/storage/' . $path;
        }

        $opportunity = Opportunity::create([
            'project_name' => $validated['project_name'],
            'category_id' => $validated['category_id'],
            'roi_estimate' => $validated['roi_estimate'] ?? null,
            'land_area' => $validated['land_area'] ?? null,
            'incentive_package' => $validated['incentive_package'] ?? null,
            'image_path' => $imagePath ?? '/images/seafood_hub.png',
            'status' => $validated['status'] ?? 'Draft',
        ]);

        return response()->json([
            'message' => 'Opportunity created successfully.',
            'opportunity' => $opportunity->load('category'),
        ], 201);
    }

    /**
     * Display the specified opportunity.
     */
    public function show(Opportunity $opportunity): JsonResponse
    {
        return response()->json($opportunity->load('category'));
    }

    /**
     * Update the specified opportunity in storage.
     */
    public function update(Request $request, Opportunity $opportunity): JsonResponse
    {
        $rules = [
            'project_name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
            'roi_estimate' => 'nullable|numeric',
            'land_area' => 'nullable|numeric',
            'incentive_package' => 'nullable|string',
            'status' => 'nullable|string|in:Draft,Published,Closed',
        ];

        if ($request->hasFile('image')) {
            $rules['image'] = 'image|max:5120';
        }

        $validated = $request->validate($rules);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('opportunities', 'public');
            $validated['image_path'] = '/storage/' . $path;
        }

        $opportunity->update($validated);

        return response()->json([
            'message' => 'Opportunity updated successfully.',
            'opportunity' => $opportunity->load('category'),
        ]);
    }

    /**
     * Remove the specified opportunity from storage.
     */
    public function destroy(Opportunity $opportunity): JsonResponse
    {
        $opportunity->delete();

        return response()->json([
            'message' => 'Opportunity deleted successfully.',
        ]);
    }
}
