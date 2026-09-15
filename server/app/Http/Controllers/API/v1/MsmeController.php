<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMsmeRequest;
use App\Http\Requests\UpdateMsmeRequest;
use App\Http\Resources\MsmeResource;
use App\Models\Msme;
use App\Models\Municipality;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MsmeController extends Controller
{
    /**
     * Display a listing of the resource for Admin.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Msme::with(['category']);

        // Search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('owner_name', 'like', "%{$search}%")
                  ->orWhere('complete_address', 'like', "%{$search}%");
            });
        }

        // Municipality filter
        if ($request->has('municipality_id') && !empty($request->municipality_id) && $request->municipality_id !== 'All') {
            $query->where('municipality_id', $request->municipality_id);
        }

        // Category/Industry filter
        if ($request->has('category_id') && !empty($request->category_id) && $request->category_id !== 'All') {
            $query->where('category_id', $request->category_id);
        }

        // Enterprise type filter
        if ($request->has('enterprise_type') && !empty($request->enterprise_type) && $request->enterprise_type !== 'All') {
            $query->where('enterprise_type', $request->enterprise_type);
        }

        // Status filter
        if ($request->has('status') && !empty($request->status) && $request->status !== 'All') {
            $query->where('status', $request->status);
        }

        // Archive filter
        $includeArchived = $request->boolean('include_archived', false);
        if (!$includeArchived) {
            $query->where('is_archived', false);
        } else {
            $query->where('is_archived', true);
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'business_name');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->input('per_page', 10);
        $msmes = $query->paginate($perPage);

        return response()->json([
            'msmes' => MsmeResource::collection($msmes->items()),
            'pagination' => [
                'current_page' => $msmes->currentPage(),
                'last_page' => $msmes->lastPage(),
                'per_page' => $msmes->perPage(),
                'total' => $msmes->total(),
            ]
        ]);
    }

    /**
     * Display listing of active non-archived resource for public/investors.
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $query = Msme::with(['category'])
            ->where('status', 'Active')
            ->where('is_archived', false);

        // Search filter
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('business_name', 'like', "%{$search}%")
                  ->orWhere('products_services', 'like', "%{$search}%");
            });
        }

        // Municipality filter
        if ($request->has('municipality_id') && !empty($request->municipality_id) && $request->municipality_id !== 'All') {
            $query->where('municipality_id', $request->municipality_id);
        }

        // Category/Industry filter
        if ($request->has('category_id') && !empty($request->category_id) && $request->category_id !== 'All') {
            $query->where('category_id', $request->category_id);
        }

        // Enterprise type filter
        if ($request->has('enterprise_type') && !empty($request->enterprise_type) && $request->enterprise_type !== 'All') {
            $query->where('enterprise_type', $request->enterprise_type);
        }

        // Pagination
        $perPage = $request->input('per_page', 9);
        $msmes = $query->orderBy('business_name', 'asc')->paginate($perPage);

        return response()->json([
            'msmes' => MsmeResource::collection($msmes->items()),
            'pagination' => [
                'current_page' => $msmes->currentPage(),
                'last_page' => $msmes->lastPage(),
                'per_page' => $msmes->perPage(),
                'total' => $msmes->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMsmeRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $fileName = 'msme_logo_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('storage/msme'), $fileName);
            $logoPath = '/storage/msme/' . $fileName;
        }

        $coverPath = null;
        if ($request->hasFile('cover')) {
            $file = $request->file('cover');
            $fileName = 'msme_cover_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('storage/msme'), $fileName);
            $coverPath = '/storage/msme/' . $fileName;
        }

        $prodImage1 = null;
        if ($request->hasFile('product_image_1')) {
            $file = $request->file('product_image_1');
            $fileName = 'msme_prod1_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('storage/msme'), $fileName);
            $prodImage1 = '/storage/msme/' . $fileName;
        }

        $prodImage2 = null;
        if ($request->hasFile('product_image_2')) {
            $file = $request->file('product_image_2');
            $fileName = 'msme_prod2_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('storage/msme'), $fileName);
            $prodImage2 = '/storage/msme/' . $fileName;
        }

        $prodImage3 = null;
        if ($request->hasFile('product_image_3')) {
            $file = $request->file('product_image_3');
            $fileName = 'msme_prod3_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('storage/msme'), $fileName);
            $prodImage3 = '/storage/msme/' . $fileName;
        }

        $msme = Msme::create([
            'business_name' => $validated['business_name'],
            'owner_name' => $validated['owner_name'],
            'category_id' => $validated['category_id'],
            'enterprise_type' => $validated['enterprise_type'],
            'municipality_id' => $validated['municipality_id'],
            'barangay' => $validated['barangay'],
            'complete_address' => $validated['complete_address'],
            'contact_number' => $validated['contact_number'],
            'email_address' => $validated['email_address'] ?? null,
            'business_description' => $validated['business_description'],
            'products_services' => $validated['products_services'] ?? null,
            'logo_path' => $logoPath,
            'cover_path' => $coverPath,
            'product_image_1' => $prodImage1,
            'product_image_2' => $prodImage2,
            'product_image_3' => $prodImage3,
            'status' => $validated['status'] ?? 'Pending Approval',
            'date_registered' => $validated['date_registered'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'is_archived' => false,
        ]);

        return response()->json([
            'message' => 'MSME record created successfully.',
            'msme' => new MsmeResource($msme->load(['category'])),
        ], 201);
    }

    /**
     * Display the specified resource for Admin.
     */
    public function show($id): JsonResponse
    {
        $msme = Msme::with(['category'])->find($id);

        if (!$msme) {
            return response()->json(['message' => 'MSME record not found.'], 404);
        }

        return response()->json([
            'msme' => new MsmeResource($msme)
        ]);
    }

    /**
     * Display the specified resource for public.
     */
    public function publicShow($id): JsonResponse
    {
        $msme = Msme::with(['category'])
            ->where('status', 'Active')
            ->where('is_archived', false)
            ->find($id);

        if (!$msme) {
            return response()->json(['message' => 'MSME record not found or is currently unavailable.'], 404);
        }

        return response()->json([
            'msme' => new MsmeResource($msme)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMsmeRequest $request, $id): JsonResponse
    {
        $msme = Msme::find($id);

        if (!$msme) {
            return response()->json(['message' => 'MSME record not found.'], 404);
        }

        $validated = $request->validated();

        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($msme->logo_path && !str_starts_with($msme->logo_path, 'http')) {
                $oldPath = public_path($msme->logo_path);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $file = $request->file('logo');
            $fileName = 'msme_logo_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('storage/msme'), $fileName);
            $msme->logo_path = '/storage/msme/' . $fileName;
        }

        if ($request->hasFile('cover')) {
            // Delete old cover
            if ($msme->cover_path && !str_starts_with($msme->cover_path, 'http')) {
                $oldPath = public_path($msme->cover_path);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            $file = $request->file('cover');
            $fileName = 'msme_cover_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('storage/msme'), $fileName);
            $msme->cover_path = '/storage/msme/' . $fileName;
        }

        if ($request->hasFile('product_image_1')) {
            // Delete old
            if ($msme->product_image_1 && !str_starts_with($msme->product_image_1, 'http')) {
                $oldPath = public_path($msme->product_image_1);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }
            $file = $request->file('product_image_1');
            $fileName = 'msme_prod1_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('storage/msme'), $fileName);
            $msme->product_image_1 = '/storage/msme/' . $fileName;
        }

        if ($request->hasFile('product_image_2')) {
            // Delete old
            if ($msme->product_image_2 && !str_starts_with($msme->product_image_2, 'http')) {
                $oldPath = public_path($msme->product_image_2);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }
            $file = $request->file('product_image_2');
            $fileName = 'msme_prod2_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('storage/msme'), $fileName);
            $msme->product_image_2 = '/storage/msme/' . $fileName;
        }

        if ($request->hasFile('product_image_3')) {
            // Delete old
            if ($msme->product_image_3 && !str_starts_with($msme->product_image_3, 'http')) {
                $oldPath = public_path($msme->product_image_3);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }
            $file = $request->file('product_image_3');
            $fileName = 'msme_prod3_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('storage/msme'), $fileName);
            $msme->product_image_3 = '/storage/msme/' . $fileName;
        }

        $msme->update([
            'business_name' => $validated['business_name'],
            'owner_name' => $validated['owner_name'],
            'category_id' => $validated['category_id'],
            'enterprise_type' => $validated['enterprise_type'],
            'municipality_id' => $validated['municipality_id'],
            'barangay' => $validated['barangay'],
            'complete_address' => $validated['complete_address'],
            'contact_number' => $validated['contact_number'],
            'email_address' => $validated['email_address'] ?? null,
            'business_description' => $validated['business_description'],
            'products_services' => $validated['products_services'] ?? null,
            'status' => $validated['status'] ?? $msme->status,
            'date_registered' => $validated['date_registered'],
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
        ]);

        return response()->json([
            'message' => 'MSME record updated successfully.',
            'msme' => new MsmeResource($msme->load(['category'])),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        $msme = Msme::find($id);

        if (!$msme) {
            return response()->json(['message' => 'MSME record not found.'], 404);
        }

        // Delete logo image
        if ($msme->logo_path && !str_starts_with($msme->logo_path, 'http')) {
            $oldPath = public_path($msme->logo_path);
            if (file_exists($oldPath)) {
                @unlink($oldPath);
            }
        }

        // Delete cover image
        if ($msme->cover_path && !str_starts_with($msme->cover_path, 'http')) {
            $oldPath = public_path($msme->cover_path);
            if (file_exists($oldPath)) {
                @unlink($oldPath);
            }
        }

        // Delete product images
        foreach (['product_image_1', 'product_image_2', 'product_image_3'] as $col) {
            if ($msme->$col && !str_starts_with($msme->$col, 'http')) {
                $oldPath = public_path($msme->$col);
                if (file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }
        }

        $msme->delete();

        return response()->json([
            'message' => 'MSME record deleted successfully.'
        ]);
    }

    /**
     * Archive/Unarchive the specified MSME.
     */
    public function archive($id): JsonResponse
    {
        $msme = Msme::find($id);

        if (!$msme) {
            return response()->json(['message' => 'MSME record not found.'], 404);
        }

        $msme->is_archived = !$msme->is_archived;
        $msme->save();

        $action = $msme->is_archived ? 'archived' : 'restored';

        return response()->json([
            'message' => "MSME record {$action} successfully.",
            'msme' => new MsmeResource($msme->load(['category']))
        ]);
    }

    /**
     * Get statistics for admin dashboard.
     */
    public function dashboardStats(): JsonResponse
    {
        $totalMsmes = Msme::where('is_archived', false)->count();

        // MSMEs by Municipality
        $byMunicipality = Msme::where('is_archived', false)
            ->get(['municipality_id'])
            ->groupBy('municipality_id')
            ->map(function ($group, $muniId) {
                $muni = Municipality::find($muniId);
                return (object)[
                    'name' => $muni ? $muni->name : 'Unknown',
                    'count' => $group->count(),
                ];
            })
            ->values();

        // MSMEs by Industry/Category
        $byIndustry = DB::table('msmes')
            ->join('categories', 'msmes.category_id', '=', 'categories.id')
            ->where('msmes.is_archived', false)
            ->select('categories.name', DB::raw('count(msmes.id) as count'))
            ->groupBy('categories.name')
            ->get();

        // Newly added businesses
        $newlyAdded = Msme::with(['category'])
            ->where('is_archived', false)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'total_msmes' => $totalMsmes,
            'msmes_by_municipality' => $byMunicipality,
            'msmes_by_industry' => $byIndustry,
            'new_businesses' => MsmeResource::collection($newlyAdded),
        ]);
    }
}
