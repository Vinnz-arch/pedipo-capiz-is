<?php

namespace App\Http\Controllers\API\v1;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\NewsArticle;
use App\Models\NewsComment;
use App\Models\User;
use App\Support\PublicMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    /**
     * Get list of news articles.
     */
    public function index(Request $request): JsonResponse
    {
        $query = NewsArticle::query();

        $authenticated = $request->user('sanctum');
        $canViewDrafts = $authenticated instanceof Admin
            || ($authenticated instanceof User && $authenticated->isStaff());

        // Show Draft articles only to authenticated Admin and PEDIPO Staff
        if (! $canViewDrafts) {
            $query->where('status', 'Published');
        }

        $articles = $query->orderBy('published_at', 'desc')->get();

        return response()->json([
            'articles' => $articles
        ]);
    }

    /**
     * Get a single news article by slug or id.
     */
    public function show(string $slugOrId): JsonResponse
    {
        $article = NewsArticle::where('slug', $slugOrId)
            ->orWhere('id', $slugOrId)
            ->with('comments')
            ->first();

        if (!$article) {
            return response()->json([
                'message' => 'Article not found.'
            ], 404);
        }

        return response()->json([
            'article' => $article
        ]);
    }

    /**
     * Store a new article (Admin only).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'required|string',
            'content' => 'required|string',
            'author' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:Published,Draft',
            'published_at' => 'nullable|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'source_name' => 'nullable|string|max:255',
            'source_url' => 'nullable|url|max:255',
        ]);

        $article = new NewsArticle();
        $article->title = $validated['title'];
        $article->slug = Str::slug($validated['title']) . '-' . uniqid();
        $article->summary = $validated['summary'];
        $article->content = $validated['content'];
        $article->author = $validated['author'] ?? 'PEDIPO Admin';
        $article->status = $validated['status'] ?? 'Published';
        $article->source_name = $validated['source_name'] ?? null;
        $article->source_url = $validated['source_url'] ?? null;
        if (!empty($validated['published_at'])) {
            $article->published_at = $validated['published_at'];
        }

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileName = 'news_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('storage/news'), $fileName);
            $article->image_path = '/storage/news/' . $fileName;
        }

        $article->save();

        return response()->json([
            'message' => 'News article created successfully.',
            'article' => $article
        ], 201);
    }

    /**
     * Update an article (Admin only).
     */
    public function update(Request $request, $id): JsonResponse
    {
        $article = NewsArticle::find($id);

        if (!$article) {
            return response()->json([
                'message' => 'Article not found.'
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'summary' => 'required|string',
            'content' => 'required|string',
            'author' => 'nullable|string|max:255',
            'status' => 'nullable|string|in:Published,Draft',
            'published_at' => 'nullable|date',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120',
            'remove_image' => 'nullable|boolean',
            'source_name' => 'nullable|string|max:255',
            'source_url' => 'nullable|url|max:255',
        ]);

        $article->title = $validated['title'];
        $article->slug = Str::slug($validated['title']) . '-' . $article->id;
        $article->summary = $validated['summary'];
        $article->content = $validated['content'];
        $article->author = $validated['author'] ?? $article->author;
        $article->status = $validated['status'] ?? $article->status;
        $article->source_name = $validated['source_name'] ?? $article->source_name;
        $article->source_url = $validated['source_url'] ?? $article->source_url;
        if (!empty($validated['published_at'])) {
            $article->published_at = $validated['published_at'];
        }

        if ($request->hasFile('image')) {
            PublicMedia::deleteIfLocal($article->image_path);

            $file = $request->file('image');
            $fileName = 'news_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('storage/news'), $fileName);
            $article->image_path = '/storage/news/' . $fileName;
        } elseif ($request->boolean('remove_image')) {
            PublicMedia::deleteIfLocal($article->image_path);
            $article->image_path = null;
        }

        $article->save();

        return response()->json([
            'message' => 'News article updated successfully.',
            'article' => $article
        ]);
    }

    /**
     * Delete an article (Admin only).
     */
    public function destroy($id): JsonResponse
    {
        $article = NewsArticle::find($id);

        if (!$article) {
            return response()->json([
                'message' => 'Article not found.'
            ], 404);
        }

        PublicMedia::deleteIfLocal($article->image_path);

        $article->delete();

        return response()->json([
            'message' => 'News article deleted successfully.'
        ]);
    }

    /**
     * Add a comment to an article (Public).
     */
    public function storeComment(Request $request, $id): JsonResponse
    {
        $article = NewsArticle::find($id);

        if (!$article) {
            return response()->json([
                'message' => 'Article not found.'
            ], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'comment' => 'required|string|max:1000',
        ]);

        $comment = NewsComment::create([
            'news_article_id' => $article->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'comment' => $validated['comment']
        ]);

        return response()->json([
            'message' => 'Comment added successfully.',
            'comment' => $comment
        ], 201);
    }
}
