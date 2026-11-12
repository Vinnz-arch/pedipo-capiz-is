<?php

namespace App\Support;

class PublicMedia
{
    /**
     * Delete a locally stored file under public/ if it is not an external URL.
     */
    public static function deleteIfLocal(?string $path): void
    {
        if (!$path || str_starts_with($path, 'http')) {
            return;
        }

        $fullPath = public_path(ltrim($path, '/'));
        if (file_exists($fullPath)) {
            @unlink($fullPath);
        }
    }
}

