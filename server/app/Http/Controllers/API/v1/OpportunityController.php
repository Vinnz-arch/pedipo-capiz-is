<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Opportunity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
            'key_incentives' => 'nullable|string',
            'description' => 'nullable|string',
            'incentive_package' => 'nullable|string',
            'status' => 'nullable|string|in:Draft,Published,Closed',
            'location' => 'nullable|string|max:255',
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
            'key_incentives' => $validated['key_incentives'] ?? null,
            'description' => $validated['description'] ?? null,
            'incentive_package' => $validated['incentive_package'] ?? $validated['key_incentives'] ?? null,
            'image_path' => $imagePath ?? '/images/seafood_hub.png',
            'status' => $validated['status'] ?? 'Draft',
            'location' => $validated['location'] ?? 'Roxas City, Capiz',
        ]);

        Cache::forget('public_opportunities');

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
            'key_incentives' => 'nullable|string',
            'description' => 'nullable|string',
            'incentive_package' => 'nullable|string',
            'status' => 'nullable|string|in:Draft,Published,Closed',
            'location' => 'nullable|string|max:255',
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
        Cache::forget('public_opportunities');

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
        Cache::forget('public_opportunities');

        return response()->json([
            'message' => 'Opportunity deleted successfully.',
        ]);
    }

    /**
     * Get published opportunities for the public/user Capiz Investor Portal.
     */
    public function publicOpportunities(): JsonResponse
    {
        $data = Cache::remember('public_opportunities', 3600, function () {
            return [
                'opportunities' => Opportunity::with('category')->where('status', 'Published')->latest()->get(),
                'categories' => Category::all(),
            ];
        });

        return response()->json($data);
    }

    /**
     * Synchronize published opportunities to the public portal and return metrics.
     */
    public function syncPortal(): JsonResponse
    {
        Cache::forget('public_opportunities');

        $publishedCount = Opportunity::where('status', 'Published')->count();
        $draftCount = Opportunity::where('status', 'Draft')->count();
        $closedCount = Opportunity::where('status', 'Closed')->count();

        return response()->json([
            'message' => 'Investor Portal synchronized successfully.',
            'synced_at' => now()->toIso8601String(),
            'stats' => [
                'published' => $publishedCount,
                'drafts' => $draftCount,
                'closed' => $closedCount,
            ]
        ]);
    }
}
