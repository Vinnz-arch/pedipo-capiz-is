<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Opportunity;
use App\Models\OpportunityDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class OpportunityController extends Controller
{
    /**
     * Display a listing of opportunities and categories.
     */
    public function index(): JsonResponse
    {
        $opportunities = Opportunity::with(['category', 'documents'])->latest()->get();
        $categories = Category::all();
        $municipalities = \App\Models\Municipality::all();

        return response()->json([
            'opportunities' => $opportunities,
            'categories' => $categories,
            'municipalities' => $municipalities,
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
            'municipality_id' => 'nullable|integer|in:1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17',
            'roi_estimate' => 'nullable|numeric',
            'land_area' => 'nullable|numeric',
            'key_incentives' => 'nullable|string',
            'description' => 'nullable|string',
            'incentive_package' => 'nullable|string',
            'status' => 'nullable|string|in:Draft,Published,Closed',
            'location' => 'nullable|string|max:255',
            'source_name' => 'nullable|string|max:255',
            'source_url' => 'nullable|url|max:255',
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
            'municipality_id' => $validated['municipality_id'] ?? null,
            'roi_estimate' => $validated['roi_estimate'] ?? null,
            'land_area' => $validated['land_area'] ?? null,
            'key_incentives' => $validated['key_incentives'] ?? null,
            'description' => $validated['description'] ?? null,
            'incentive_package' => $validated['incentive_package'] ?? $validated['key_incentives'] ?? null,
            'image_path' => $imagePath,
            'status' => $validated['status'] ?? 'Draft',
            'location' => $validated['location'] ?? 'Roxas City, Capiz',
            'source_name' => $validated['source_name'] ?? null,
            'source_url' => $validated['source_url'] ?? null,
        ]);

        Cache::forget('public_opportunities');

        return response()->json([
            'message' => 'Opportunity created successfully.',
            'opportunity' => $opportunity->load(['category']),
        ], 201);
    }

    /**
     * Display the specified opportunity.
     */
    public function show(Opportunity $opportunity): JsonResponse
    {
        return response()->json($opportunity->load(['category', 'documents']));
    }

    /**
     * Update the specified opportunity in storage.
     */
    public function update(Request $request, Opportunity $opportunity): JsonResponse
    {
        $rules = [
            'project_name' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|required|exists:categories,id',
            'municipality_id' => 'sometimes|nullable|integer|in:1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17',
            'roi_estimate' => 'nullable|numeric',
            'land_area' => 'nullable|numeric',
            'key_incentives' => 'nullable|string',
            'description' => 'nullable|string',
            'incentive_package' => 'nullable|string',
            'status' => 'nullable|string|in:Draft,Published,Closed',
            'location' => 'nullable|string|max:255',
            'source_name' => 'nullable|string|max:255',
            'source_url' => 'nullable|url|max:255',
            'remove_image' => 'nullable|boolean',
        ];

        if ($request->hasFile('image')) {
            $rules['image'] = 'image|max:5120';
        }

        $validated = $request->validate($rules);
        unset($validated['remove_image']);

        if ($request->hasFile('image')) {
            $opportunity->deleteStoredImageFile();
            $path = $request->file('image')->store('opportunities', 'public');
            $validated['image_path'] = '/storage/' . $path;
        } elseif ($request->boolean('remove_image')) {
            $opportunity->deleteStoredImageFile();
            $validated['image_path'] = null;
        }

        $opportunity->update($validated);
        Cache::forget('public_opportunities');

        return response()->json([
            'message' => 'Opportunity updated successfully.',
            'opportunity' => $opportunity->load(['category', 'documents']),
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
                'opportunities' => Opportunity::with(['category', 'documents'])->where('status', 'Published')->latest()->get(),
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
        Cache::forget('public_parent_opportunities');

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

    /**
     * Get spreadsheet data for a specific opportunity.
     */
    public function getSpreadsheet($id): JsonResponse
    {
        $opportunity = Opportunity::with(['category'])->findOrFail($id);

        return response()->json([
            'opportunity' => [
                'id' => $opportunity->id,
                'project_name' => $opportunity->project_name,
                'category' => $opportunity->category ? $opportunity->category->name : 'General',
                'location' => $opportunity->municipality ? $opportunity->municipality->name : ($opportunity->location ?? 'Capiz'),
                'status' => $opportunity->status,
                'land_area' => $opportunity->land_area,
            ],
            'spreadsheet_data' => $opportunity->spreadsheet_data ?? [
                'headers' => [],
                'rows' => []
            ]
        ]);
    }

    /**
     * Update spreadsheet data for a specific opportunity (Admin).
     */
    public function updateSpreadsheet(Request $request, $id): JsonResponse
    {
        $opportunity = Opportunity::findOrFail($id);

        $validated = $request->validate([
            'headers' => 'present|array',
            'rows' => 'present|array',
            'filename' => 'nullable|string|max:255',
            'file_path' => 'nullable|string',
            'file_size' => 'nullable|integer',
            'sheets' => 'nullable|array',
            'html' => 'nullable|string',
        ]);

        $opportunity->spreadsheet_data = [
            'headers' => $validated['headers'],
            'rows' => $validated['rows'],
            'sheets' => $validated['sheets'] ?? ($opportunity->spreadsheet_data['sheets'] ?? null),
            'html' => $validated['html'] ?? ($opportunity->spreadsheet_data['html'] ?? null),
            'filename' => $validated['filename'] ?? ($opportunity->spreadsheet_data['filename'] ?? null),
            'file_path' => $validated['file_path'] ?? ($opportunity->spreadsheet_data['file_path'] ?? null),
            'file_size' => $validated['file_size'] ?? ($opportunity->spreadsheet_data['file_size'] ?? null),
            'updated_at' => now()->toIso8601String(),
        ];
        $opportunity->save();

        Cache::forget('public_opportunities');

        return response()->json([
            'message' => 'Spreadsheet data updated successfully.',
            'spreadsheet_data' => $opportunity->spreadsheet_data,
        ]);
    }

    /**
     * Upload physical spreadsheet file (.xlsx, .csv, etc.) and save preview data (Admin).
     */
    public function uploadSpreadsheet(Request $request, $id): JsonResponse
    {
        $opportunity = Opportunity::findOrFail($id);

        $request->validate([
            'file' => 'required|file|max:51200',
            'headers' => 'nullable',
            'rows' => 'nullable',
            'sheets' => 'nullable',
            'html' => 'nullable|string',
        ]);

        $file = $request->file('file');

        // Delete previous spreadsheet file if exists
        if (!empty($opportunity->spreadsheet_data['file_path'])) {
            $prevRelative = str_replace('/storage/', '', $opportunity->spreadsheet_data['file_path']);
            if (Storage::disk('public')->exists($prevRelative)) {
                Storage::disk('public')->delete($prevRelative);
            }
        }

        $path = $file->store('opportunities/spreadsheets', 'public');
        $filePath = '/storage/' . $path;

        // Decode JSON inputs if passed as strings in FormData
        $headers = is_string($request->input('headers')) 
            ? json_decode($request->input('headers'), true) 
            : ($request->input('headers') ?? []);

        $rows = is_string($request->input('rows')) 
            ? json_decode($request->input('rows'), true) 
            : ($request->input('rows') ?? []);

        $sheets = is_string($request->input('sheets')) 
            ? json_decode($request->input('sheets'), true) 
            : ($request->input('sheets') ?? []);

        $opportunity->spreadsheet_data = [
            'file_path' => $filePath,
            'filename' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'headers' => $headers ?? [],
            'rows' => $rows ?? [],
            'sheets' => $sheets ?? [],
            'html' => $request->input('html'),
            'updated_at' => now()->toIso8601String(),
            'uploaded_at' => now()->toIso8601String(),
        ];
        $opportunity->save();

        Cache::forget('public_opportunities');

        return response()->json([
            'message' => 'Spreadsheet file uploaded and stored successfully.',
            'spreadsheet_data' => $opportunity->spreadsheet_data,
        ]);
    }

    /**
     * Remove / clear spreadsheet data for an opportunity (Admin).
     */
    public function deleteSpreadsheet($id): JsonResponse
    {
        $opportunity = Opportunity::findOrFail($id);

        // Delete stored file if exists
        if (!empty($opportunity->spreadsheet_data['file_path'])) {
            $prevRelative = str_replace('/storage/', '', $opportunity->spreadsheet_data['file_path']);
            if (Storage::disk('public')->exists($prevRelative)) {
                Storage::disk('public')->delete($prevRelative);
            }
        }

        $opportunity->spreadsheet_data = null;
        $opportunity->save();

        Cache::forget('public_opportunities');

        return response()->json([
            'message' => 'Spreadsheet data removed successfully.',
            'spreadsheet_data' => null,
        ]);
    }

    /**
     * Get documents for an opportunity.
     */
    public function getDocuments($id): JsonResponse
    {
        $opportunity = Opportunity::findOrFail($id);
        return response()->json([
            'documents' => $opportunity->documents,
        ]);
    }

    /**
     * Upload an attachment document for an opportunity.
     */
    public function uploadDocument(Request $request, $id): JsonResponse
    {
        $opportunity = Opportunity::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'document' => 'required|file|max:51200|mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,zip,txt',
        ]);

        $file = $request->file('document');
        $originalName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $extension = $file->getClientOriginalExtension();

        $path = $file->store('opportunities/documents', 'public');
        $filePath = '/storage/' . $path;

        $doc = OpportunityDocument::create([
            'opportunity_id' => $opportunity->id,
            'title' => $request->input('title'),
            'file_path' => $filePath,
            'file_name' => $originalName,
            'file_size' => $fileSize,
            'file_type' => strtolower($extension),
        ]);

        Cache::forget('public_opportunities');

        return response()->json([
            'message' => 'Document uploaded successfully.',
            'document' => $doc,
            'documents' => $opportunity->documents()->get(),
        ], 201);
    }

    /**
     * Delete an attached document.
     */
    public function deleteDocument($id, $documentId): JsonResponse
    {
        $opportunity = Opportunity::findOrFail($id);
        $document = OpportunityDocument::where('opportunity_id', $opportunity->id)
            ->where('id', $documentId)
            ->firstOrFail();

        // Delete physical file if present
        $relativePath = str_replace('/storage/', '', $document->file_path);
        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }

        $document->delete();
        Cache::forget('public_opportunities');

        return response()->json([
            'message' => 'Document deleted successfully.',
            'documents' => $opportunity->documents()->get(),
        ]);
    }

    /**
     * Stream or preview a document file directly with inline headers and CORS.
     */
    public function streamDocument($id, $documentId)
    {
        $opportunity = Opportunity::findOrFail($id);
        $document = OpportunityDocument::where('opportunity_id', $opportunity->id)
            ->where('id', $documentId)
            ->firstOrFail();

        $relativePath = str_replace('/storage/', '', $document->file_path);
        if (!Storage::disk('public')->exists($relativePath)) {
            return response()->json(['message' => 'File not found on server.'], 404);
        }

        $fullPath = Storage::disk('public')->path($relativePath);
        $mimeType = File::mimeType($fullPath) ?: 'application/octet-stream';

        $isDownload = request()->boolean('download') || request()->query('download') === '1' || request()->query('download') === 'true';
        $disposition = $isDownload ? 'attachment' : 'inline';

        return response()->file($fullPath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => "{$disposition}; filename=\"{$document->file_name}\"",
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => '*',
            'Access-Control-Expose-Headers' => 'Content-Disposition, Content-Type, Content-Length',
        ]);
    }

    /**
     * Download the exact uploaded spreadsheet file for an opportunity.
     */
    public function downloadSpreadsheet($id)
    {
        $opportunity = Opportunity::findOrFail($id);
        $spreadsheetData = $opportunity->spreadsheet_data ?? [];
        $filePath = $spreadsheetData['file_path'] ?? null;
        $filename = $spreadsheetData['filename'] ?? ($opportunity->project_name . '.xlsx');

        if (!$filePath) {
            return response()->json(['message' => 'No spreadsheet file attached to this opportunity.'], 404);
        }

        $relativePath = str_replace('/storage/', '', $filePath);
        if (!Storage::disk('public')->exists($relativePath)) {
            return response()->json(['message' => 'Spreadsheet file not found on server.'], 404);
        }

        $fullPath = Storage::disk('public')->path($relativePath);
        $mimeType = Storage::disk('public')->mimeType($relativePath) ?: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        return response()->download($fullPath, $filename, [
            'Content-Type' => $mimeType,
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, OPTIONS',
            'Access-Control-Allow-Headers' => '*',
            'Access-Control-Expose-Headers' => 'Content-Disposition',
        ]);
    }
}

