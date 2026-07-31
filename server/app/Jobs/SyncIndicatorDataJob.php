<?php

namespace App\Jobs;

use App\Services\DataSyncService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SyncIndicatorDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(DataSyncService $syncService): void
    {
        Log::info('Starting scheduled Municipal Indicator Data Synchronization Job.');

        $results = $syncService->syncAll();

        foreach ($results as $source => $res) {
            if ($res['status'] === 'success') {
                Log::info("Successfully synchronized indicator data from source: {$source}. Records: {$res['records']}");
            } else {
                Log::error("Failed to synchronize indicator data from source: {$source}. Error: {$res['error']}");
            }
        }

        Log::info('Completed scheduled Municipal Indicator Data Synchronization Job.');
    }
}
