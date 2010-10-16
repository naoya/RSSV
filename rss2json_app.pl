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
        title    => trim($_->{title}),
        url      => $_->{link},
        # content  => $_->{content}->{encoded},
    }} @{$rss->{items}};
    $self->stash(json => \@items);
};

get '/list' => sub {
    my $self = shift;
    $self->stash(json => [
        {
            title => 'Appcelerator Developer Center',
            url   => 'http://developer.appcelerator.com/blog/feed',
        },
        {
            title => 'TechCrunch Japan',
            url   => 'http://www.pheedo.jp/f/JapaneseTechCrunch'
        },
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

sub trim {
    my $text = shift;
    $text =~ s/^\s+//g;
    $text =~ s/\s+$//g;
    return $text;
}
