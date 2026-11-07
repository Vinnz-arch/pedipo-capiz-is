<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Municipality;
use App\Models\Opportunity;
use App\Models\ParentOpportunity;
use App\Models\ParentOpportunityDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class ParentOpportunityController extends Controller
{
    /**
     * List all parent opportunities with their child projects (Admin).
     */
    public function index(): JsonResponse
    {
        $parents = ParentOpportunity::with([
            'category',
            'documents',
            'projects' => function ($query) {
                $query->with(['category', 'documents'])->latest();
            }
        ])->latest()->get();

        $standalone = Opportunity::whereNull('parent_opportunity_id')
            ->with(['category', 'documents'])
            ->latest()
            ->get();

        $categories = Category::all();
        $municipalities = Municipality::all();

        return response()->json([
            'parent_opportunities' => $parents,
            'standalone_opportunities' => $standalone,
            'categories' => $categories,
            'municipalities' => $municipalities,
        ]);
    }

    /**
     * List published parent opportunities and their published child projects (Investor Portal).
     */
    public function publicIndex(): JsonResponse
    {
        $parents = Cache::remember('public_parent_opportunities', 3600, function () {
            return ParentOpportunity::where('status', 'Published')
                ->with([
                    'category',
                    'documents',
                    'projects' => function ($query) {
                        $query->where('status', 'Published')
                            ->with(['category', 'documents'])
                            ->latest();
                    }
                ])
                ->latest()
                ->get();
        });

        $categories = Category::all();
        $municipalities = Municipality::all();

        return response()->json([
            'parent_opportunities' => $parents,
            'categories' => $categories,
            'municipalities' => $municipalities,
        ]);
    }

    /**
     * Store a new parent opportunity.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:Draft,Published,Closed',
            'image' => 'nullable|image|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('opportunities/parents', 'public');
            $imagePath = '/storage/' . $path;
        }

        $parent = ParentOpportunity::create([
            'name' => $validated['name'],
            'category_id' => $validated['category_id'] ?? null,
            'description' => $validated['description'] ?? null,
            'status' => $validated['status'] ?? 'Published',
            'image_path' => $imagePath ?? '/images/seafood_hub.png',
        ]);

        Cache::forget('public_parent_opportunities');
        Cache::forget('public_opportunities');

        return response()->json([
            'message' => 'Parent opportunity created successfully.',
            'parent_opportunity' => $parent->load(['category', 'projects']),
        ], 201);
    }

    /**
     * Show a single parent opportunity with child projects.
     */
    public function show(ParentOpportunity $parentOpportunity): JsonResponse
    {
        return response()->json(
            $parentOpportunity->load([
                'category',
                'projects' => function ($query) {
                    $query->with(['category', 'documents'])->latest();
                }
            ])
        );
    }

    /**
     * Update a parent opportunity.
     */
    public function update(Request $request, ParentOpportunity $parentOpportunity): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|nullable|exists:categories,id',
            'description' => 'nullable|string',
            'status' => 'nullable|string|in:Draft,Published,Closed',
            'image' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('opportunities/parents', 'public');
            $validated['image_path'] = '/storage/' . $path;
        }

        $parentOpportunity->update($validated);

        Cache::forget('public_parent_opportunities');
        Cache::forget('public_opportunities');

        return response()->json([
            'message' => 'Parent opportunity updated successfully.',
            'parent_opportunity' => $parentOpportunity->load(['category', 'projects']),
        ]);
    }

    /**
     * Delete a parent opportunity.
     */
    public function destroy(ParentOpportunity $parentOpportunity): JsonResponse
    {
        // Detach or prevent deleting if projects exist
        if ($parentOpportunity->projects()->count() > 0) {
            // Unlink child projects so they are not deleted
            $parentOpportunity->projects()->update(['parent_opportunity_id' => null]);
        }

        $parentOpportunity->delete();

        Cache::forget('public_parent_opportunities');
        Cache::forget('public_opportunities');

        return response()->json([
            'message' => 'Parent opportunity removed successfully.',
        ]);
    }

    /**
     * Create a child project under this parent opportunity.
     * Contains ONLY the 8 required fields.
     */
    public function storeChildProject(Request $request, ParentOpportunity $parentOpportunity): JsonResponse
    {
        $validated = $request->validate([
            'project_name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'land_area' => 'nullable|numeric',
            'status' => 'nullable|string|in:Draft,Published,Closed',
            'municipality_id' => 'nullable|integer|in:1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('opportunities', 'public');
            $imagePath = '/storage/' . $path;
        }

        // Default category to parent category if not explicitly provided
        $catId = $validated['category_id'] ?? $parentOpportunity->category_id;
        if (!$catId) {
            $catId = Category::first()?->id ?? 1;
        }

        $project = Opportunity::create([
            'parent_opportunity_id' => $parentOpportunity->id,
            'project_name' => $validated['project_name'],
            'category_id' => $catId,
            'land_area' => $validated['land_area'] ?? null,
            'status' => $validated['status'] ?? 'Draft',
            'municipality_id' => $validated['municipality_id'] ?? null,
            'location' => $validated['location'] ?? null,
            'description' => $validated['description'] ?? null,
            'image_path' => $imagePath ?? '/images/seafood_hub.png',
        ]);

        Cache::forget('public_parent_opportunities');
        Cache::forget('public_opportunities');

        return response()->json([
            'message' => 'Child project added successfully.',
            'project' => $project->load(['category', 'documents']),
        ], 201);
    }

    /**
     * Update an existing child project.
     * Accepts ONLY the 8 primary fields.
     */
    public function updateChildProject(Request $request, Opportunity $project): JsonResponse
    {
        $validated = $request->validate([
            'project_name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|nullable|exists:categories,id',
            'land_area' => 'nullable|numeric',
            'status' => 'nullable|string|in:Draft,Published,Closed',
            'municipality_id' => 'nullable|integer|in:1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('opportunities', 'public');
            $validated['image_path'] = '/storage/' . $path;
        }

        $project->update($validated);

        Cache::forget('public_parent_opportunities');
        Cache::forget('public_opportunities');

        return response()->json([
            'message' => 'Child project updated successfully.',
            'project' => $project->load(['category', 'documents']),
        ]);
    }

    /**
     * Move a child project from one parent opportunity to another.
     */
    public function moveChildProject(Request $request, Opportunity $project): JsonResponse
    {
        $validated = $request->validate([
            'parent_opportunity_id' => 'required|exists:parent_opportunities,id',
        ]);

        $newParent = ParentOpportunity::findOrFail($validated['parent_opportunity_id']);

        $project->update([
            'parent_opportunity_id' => $newParent->id,
            // Update category to match new parent if available
            'category_id' => $newParent->category_id ?? $project->category_id,
        ]);

        Cache::forget('public_parent_opportunities');
        Cache::forget('public_opportunities');

        return response()->json([
            'message' => "Project successfully moved to {$newParent->name}.",
            'project' => $project->load(['category', 'documents']),
        ]);
    }

    /**
     * Delete a child project.
     */
    public function destroyChildProject(Opportunity $project): JsonResponse
    {
        $project->delete();

        Cache::forget('public_parent_opportunities');
        Cache::forget('public_opportunities');

        return response()->json([
            'message' => 'Child project deleted successfully.',
        ]);
    }

    /**
     * Get overall operators and production data for a parent opportunity.
     */
    public function getOperatorsAndProduction($id): JsonResponse
    {
        $parent = ParentOpportunity::with(['category', 'documents'])->findOrFail($id);

        $existing = $parent->spreadsheet_data ?? [];
        $reports = $existing['annual_reports'] ?? [];

        // Legacy single file support
        if (empty($reports) && !empty($existing['filename'])) {
            $reports[] = [
                'id' => 'legacy',
                'filename' => $existing['filename'],
                'file_path' => $existing['file_path'] ?? null,
                'file_size' => $existing['file_size'] ?? null,
                'uploaded_at' => $existing['uploaded_at'] ?? null,
            ];
        }

        return response()->json([
            'parent_opportunity' => [
                'id' => $parent->id,
                'name' => $parent->name,
                'category' => $parent->category ? $parent->category->name : 'General',
                'description' => $parent->description,
                'data_year' => $parent->data_year ?? date('Y'),
                'status' => $parent->status,
                'projects_count' => $parent->projects_count,
            ],
            'annual_reports' => $reports,
            'spreadsheet_data' => $parent->spreadsheet_data,
            'documents' => $parent->documents,
        ]);
    }

    /**
     * Update overall operators and production spreadsheet data and baseline year (Admin).
     */
    public function updateOperatorsAndProduction(Request $request, $id): JsonResponse
    {
        $parent = ParentOpportunity::findOrFail($id);

        $validated = $request->validate([
            'data_year' => 'nullable|string|max:50',
            'headers' => 'nullable|array',
            'rows' => 'nullable|array',
            'filename' => 'nullable|string',
            'file_path' => 'nullable|string',
            'file_size' => 'nullable|integer',
            'annual_reports' => 'nullable|array',
        ]);

        $parent->data_year = $validated['data_year'] ?? $parent->data_year ?? date('Y');
        $existing = $parent->spreadsheet_data ?? [];

        $reports = $validated['annual_reports'] ?? ($existing['annual_reports'] ?? []);

        $parent->spreadsheet_data = [
            'headers' => $validated['headers'] ?? ($existing['headers'] ?? []),
            'rows' => $validated['rows'] ?? ($existing['rows'] ?? []),
            'annual_reports' => $reports,
            'data_year' => $parent->data_year,
            'filename' => $validated['filename'] ?? ($existing['filename'] ?? null),
            'file_path' => $validated['file_path'] ?? ($existing['file_path'] ?? null),
            'file_size' => $validated['file_size'] ?? ($existing['file_size'] ?? null),
            'updated_at' => now()->toIso8601String(),
        ];
        $parent->save();

        Cache::forget('public_parent_opportunities');

        return response()->json([
            'message' => 'Overall operators and production data updated successfully.',
            'annual_reports' => $reports,
            'spreadsheet_data' => $parent->spreadsheet_data,
        ]);
    }

    /**
     * Upload one or multiple annual report spreadsheet files (Admin).
     */
    public function uploadSpreadsheet(Request $request, $id): JsonResponse
    {
        $parent = ParentOpportunity::findOrFail($id);

        $request->validate([
            'files' => 'nullable|array',
            'files.*' => 'file|max:51200',
            'file' => 'nullable|file|max:51200',
        ]);

        $uploadedFiles = [];
        if ($request->hasFile('files')) {
            $uploadedFiles = $request->file('files');
        } elseif ($request->hasFile('file')) {
            $uploadedFiles = [$request->file('file')];
        }

        if (empty($uploadedFiles)) {
            return response()->json(['message' => 'No files were provided.'], 422);
        }

        $existing = $parent->spreadsheet_data ?? [];
        $reports = $existing['annual_reports'] ?? [];

        if (empty($reports) && !empty($existing['filename'])) {
            $reports[] = [
                'id' => uniqid(),
                'filename' => $existing['filename'],
                'file_path' => $existing['file_path'] ?? null,
                'file_size' => $existing['file_size'] ?? null,
                'uploaded_at' => $existing['uploaded_at'] ?? now()->toIso8601String(),
            ];
        }

        foreach ($uploadedFiles as $file) {
            $path = $file->store('opportunities/annual_reports', 'public');
            $filePath = '/storage/' . $path;
            $reports[] = [
                'id' => uniqid(),
                'filename' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'file_type' => strtolower($file->getClientOriginalExtension()),
                'uploaded_at' => now()->toIso8601String(),
            ];
        }

        $parent->spreadsheet_data = [
            'annual_reports' => $reports,
            'filename' => count($reports) > 0 ? $reports[count($reports) - 1]['filename'] : null,
            'file_path' => count($reports) > 0 ? $reports[count($reports) - 1]['file_path'] : null,
            'file_size' => count($reports) > 0 ? $reports[count($reports) - 1]['file_size'] : null,
            'uploaded_at' => now()->toIso8601String(),
        ];
        $parent->save();

        Cache::forget('public_parent_opportunities');

        return response()->json([
            'message' => 'Annual report spreadsheet file(s) uploaded successfully.',
            'annual_reports' => $reports,
            'spreadsheet_data' => $parent->spreadsheet_data,
        ]);
    }

    /**
     * Delete a specific annual report file (Admin).
     */
    public function deleteSpreadsheetFile(Request $request, $id, $fileId): JsonResponse
    {
        $parent = ParentOpportunity::findOrFail($id);
        $existing = $parent->spreadsheet_data ?? [];
        $reports = $existing['annual_reports'] ?? [];

        $reports = array_values(array_filter($reports, function ($r) use ($fileId) {
            return ($r['id'] ?? '') !== $fileId && ($r['filename'] ?? '') !== $fileId;
        }));

        $parent->spreadsheet_data = [
            'annual_reports' => $reports,
            'filename' => count($reports) > 0 ? $reports[count($reports) - 1]['filename'] : null,
            'file_path' => count($reports) > 0 ? $reports[count($reports) - 1]['file_path'] : null,
            'file_size' => count($reports) > 0 ? $reports[count($reports) - 1]['file_size'] : null,
            'uploaded_at' => now()->toIso8601String(),
        ];
        $parent->save();

        Cache::forget('public_parent_opportunities');

        return response()->json([
            'message' => 'Annual report file removed successfully.',
            'annual_reports' => $reports,
            'spreadsheet_data' => $parent->spreadsheet_data,
        ]);
    }

    /**
     * Remove / clear all uploaded annual report spreadsheets (Admin).
     */
    public function deleteSpreadsheet($id): JsonResponse
    {
        $parent = ParentOpportunity::findOrFail($id);
        $parent->spreadsheet_data = null;
        $parent->save();

        Cache::forget('public_parent_opportunities');

        return response()->json([
            'message' => 'Annual report spreadsheets removed successfully.',
            'annual_reports' => [],
            'spreadsheet_data' => null,
        ]);
    }

    /**
     * Upload an attachment document for the parent opportunity overall data.
     */
    public function uploadDocument(Request $request, $id): JsonResponse
    {
        $parent = ParentOpportunity::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'document' => 'required|file|max:51200|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,txt',
        ]);

        $file = $request->file('document');
        $originalName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $extension = $file->getClientOriginalExtension();

        $path = $file->store('parent_opportunities/documents', 'public');
        $filePath = '/storage/' . $path;

        $doc = ParentOpportunityDocument::create([
            'parent_opportunity_id' => $parent->id,
            'title' => $request->input('title'),
            'file_path' => $filePath,
            'file_name' => $originalName,
            'file_size' => $fileSize,
            'file_type' => strtolower($extension),
        ]);

        Cache::forget('public_parent_opportunities');

        return response()->json([
            'message' => 'Document uploaded successfully.',
            'document' => $doc,
            'documents' => $parent->documents()->get(),
        ], 201);
    }

    /**
     * Delete an attached document for the parent opportunity.
     */
    public function deleteDocument($id, $documentId): JsonResponse
    {
        $parent = ParentOpportunity::findOrFail($id);
        $document = ParentOpportunityDocument::where('parent_opportunity_id', $parent->id)
            ->where('id', $documentId)
            ->firstOrFail();

        $relativePath = str_replace('/storage/', '', $document->file_path);
        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }

        $document->delete();
        Cache::forget('public_parent_opportunities');

        return response()->json([
            'message' => 'Document deleted successfully.',
            'documents' => $parent->documents()->get(),
        ]);
    }

    /**
     * Stream or preview an attached document directly.
     */
    public function streamDocument($id, $documentId)
    {
        $parent = ParentOpportunity::findOrFail($id);
        $document = ParentOpportunityDocument::where('parent_opportunity_id', $parent->id)
            ->where('id', $documentId)
            ->firstOrFail();

        $relativePath = str_replace('/storage/', '', $document->file_path);
        if (!Storage::disk('public')->exists($relativePath)) {
            return response()->json(['message' => 'File not found on server.'], 404);
        }

        $fileContent = Storage::disk('public')->get($relativePath);
        $mimeType = Storage::disk('public')->mimeType($relativePath) ?: 'application/octet-stream';

        return response($fileContent, 200, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $document->file_name . '"',
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With',
            'Cache-Control' => 'no-cache, private',
        ]);
    }
}
