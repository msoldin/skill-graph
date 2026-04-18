create table roadmaps (
  id bigserial primary key,
  slug text not null unique,
  title text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table topics (
  id bigserial primary key,
  slug text not null unique,
  name text not null,
  summary text not null default '',
  created_at timestamptz not null default now()
);

create table roadmap_topics (
  id bigserial primary key,
  roadmap_id bigint not null references roadmaps(id) on delete cascade,
  topic_id bigint not null references topics(id) on delete restrict,
  label_override text,
  x numeric(10, 2),
  y numeric(10, 2),
  group_key text,
  is_entrypoint boolean not null default false,
  unique (roadmap_id, topic_id)
);

create table roadmap_edges (
  id bigserial primary key,
  roadmap_id bigint not null references roadmaps(id) on delete cascade,
  source_roadmap_topic_id bigint not null references roadmap_topics(id) on delete cascade,
  target_roadmap_topic_id bigint not null references roadmap_topics(id) on delete cascade,
  edge_type text not null check (edge_type in ('prerequisite', 'related', 'recommended'))
);

create table roadmap_topic_assets (
  id bigserial primary key,
  roadmap_topic_id bigint not null references roadmap_topics(id) on delete cascade,
  asset_type text not null check (asset_type in ('markdown', 'pdf', 'json', 'yaml')),
  file_path text not null,
  title text not null,
  sort_order integer not null default 0
);

create index idx_roadmap_topics_roadmap on roadmap_topics (roadmap_id);
create index idx_roadmap_edges_source on roadmap_edges (roadmap_id, source_roadmap_topic_id);
create index idx_roadmap_edges_target on roadmap_edges (roadmap_id, target_roadmap_topic_id);
create index idx_assets_roadmap_topic on roadmap_topic_assets (roadmap_topic_id, sort_order);
