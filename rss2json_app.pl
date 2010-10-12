#!/usr/bin/env perl
use utf8;
use Mojolicious::Lite;

use XML::RSS::LibXML;
use LWP::Simple ();

app->renderer->default_format('json');
app->types->type(json => 'application/json; charset=utf-8');

get '/feed' => sub {
    my $self = shift;
    my $url = $self->param('url');

    my $xml = LWP::Simple::get($url) or die;
    my $rss = XML::RSS::LibXML->new;
    $rss->parse($xml);

    my @items = map { +{
        title    => $_->{title},
        url      => $_->{link},
    }} @{$rss->{items}};
    $self->stash(json => \@items);
};

get '/list' => sub {
    my $self = shift;
    $self->stash(json => [
        {
            title => 'naoyaのはてなダイアリー',
            url   => 'http://d.hatena.ne.jp/naoya/rss',
        },
        {
            title => 'はてなブックマーク - 人気エントリー',
            url   => 'http://b.hatena.ne.jp/hotentry.rss'
        },
    ]);
};

app->start;
