<!DOCTYPE html>
<html lang = "{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset = "utf-8">
    <meta name = "viewport" content = "width=device-width, initial-scale=1">
    <title>SSE With Mercure - Laravel</title>
    <meta name = "csrf-token" content = "{{ csrf_token() }}">
    <link href = "{{ asset('css/app.css') }}" rel = "stylesheet">
</head>

<body>
    <div id = "user">
    </div>
    
    <script src = "{{ asset('js/app.js') }}" defer></script>
</body>
</html>
