<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->json('blocks')->nullable();
        });

        // Прежнее тело переносится одним блоком: HTML остаётся HTML внутри
        // markdown — автоконвертация необратима и меняла бы опубликованный текст.
        DB::table('posts')->select('id', 'body')->orderBy('id')->chunk(200, function ($posts): void {
            foreach ($posts as $post) {
                $body = (string) ($post->body ?? '');

                DB::table('posts')->where('id', $post->id)->update([
                    'blocks' => json_encode(
                        $body === '' ? [] : [['id' => (string) Str::ulid(), 'title' => '', 'markdown' => $body]],
                        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES,
                    ),
                ]);
            }
        });
    }

    public function down(): void
    {
        // `body` заполнен и не трогался — посты переживают откат без потерь
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('blocks');
        });
    }
};
