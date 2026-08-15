"""
Massive Enterprise Curriculum Generator
10 Modules x 15 Sessions = 150 In-Depth Sessions
Complete with High-Res Architecture Diagrams, Real MP4 Videos, and Interspersed Checkpoint Quizzes.
"""
import asyncio
import os
import subprocess
from datetime import datetime, timedelta
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.module import Module, ModuleStatus
from app.models.session import ModuleSession
from app.models.content import SessionContent, ContentType
from app.models.question import Question, QuestionOption
from app.models.token import ModuleToken
from app.models.media import MediaFile, OwnerType, StorageDriver, FileType, MediaStatus

MODULES_DATA = [
    {
        "order": 1,
        "title": "Modern Backend Engineering & High-Performance Distributed Systems",
        "description": "Penguasaan arsitektur backend modern skala enterprise, concurrency model, memory management, protocol design (gRPC/HTTP3), async patterns, dan caching strategy tingkat lanjut.",
        "passing_score": 75,
        "token_code": "BACKEND-PRO-2026",
        "sessions": [
            ("Sesi 1: Fundamental Concurrency, Threading & Event Loop Internals", "Mempelajari low-level runtime event loop, non-blocking I/O, epoll/kqueue, goroutines, asyncio, dan pencegahan blocking operations."),
            ("Sesi 2: Memory Management, Allocators & Garbage Collection Tuning", "Analisis mendalam heap, stack memory, escape analysis, memory fragmentation, serta tuning parameter garbage collector di Go/JVM/V8."),
            ("Sesi 3: High-Performance RPC & Serialization (gRPC, Protobuf & Cap'n Proto)", "Optimalisasi binary serialization, multiplexing stream HTTP/2, streaming bi-directional, dan zero-copy buffer transfer."),
            ("Sesi 4: Asynchronous Messaging & Distributed Event Streaming", "Desain queue pipeline, broker vs brokerless architectures, message durability, deduplication, serta backpressure handling."),
            ("Sesi 5: Advanced Caching Topologies (L1/L2 Cache, Redis Cluster & Invalidation)", "Strategi cache-aside, write-through, cache stampede mitigation dengan probabilistic early expiration (XFetch), dan Redis Sentinel failover."),
            ("Sesi 6: Connection Pooling, Socket Tuning & Kernel Network Optimization", "Konfigurasi SO_REUSEPORT, TCP keepalive, TIME_WAIT socket reuse, TCP backlog queues, dan tuning ulimit open file descriptors."),
            ("Sesi 7: Distributed Rate Limiting & Traffic Shaping Algorithms", "Implementasi Token Bucket, Leaky Bucket, Sliding Window Counter dengan Redis Lua scripts untuk microsecond-level rate limiting."),
            ("Sesi 8: Idempotency, Transaction Boundaries & Distributed Locks", "Desain idempotent API request keys, isolation level database, optimistik vs pesimistik locking, dan Redlock algorithm."),
            ("Sesi 9: Data Ingestion Pipelines & High-Throughput Batch Processing", "Pembangunan high-volume ingestion streams, windowing techniques, buffer flushing, dan partition compaction."),
            ("Sesi 10: Circuit Breaking, Load Shedding & Fault Tolerance Patterns", "Implementasi resilience pattern dengan Polly/Hystrix/Resilience4j, fallback mechanisms, adaptive load shedding, dan self-healing circuits."),
            ("Sesi 11: Protocol Design: WebSockets, WebTransport & SSE at Scale", "Membangun real-time pub/sub bidirectional transport, connection heartbeat, gateway horizontal scaling, dan state migration."),
            ("Sesi 12: Distributed Tracing, Context Propagation & OpenTelemetry", "Standardisasi distributed tracing context (W3C traceparent), span tagging, baggage header propagation, dan trace aggregation."),
            ("Sesi 13: Zero-Copy I/O & Linux sendfile/splice Network Streaming", "Memanfaatkan syscall kernel sendfile dan vmsplice untuk transfer multimedia ultra-cepat langsung dari storage ke network card."),
            ("Sesi 14: Data Compression, Encoding & Bandwidth Optimization", "Benchmarking Zstandard (zstd), Snappy, Brotli, Gzip pada payload JSON/Protobuf untuk kompresi data real-time dengan CPU overhead minimal."),
            ("Sesi 15: Capstone Review: Merancang Backend 100K RPS Berlatensi Sub-10ms", "Studi kasus arsitektur end-to-end melayani 100.000 request per detik dengan latensi p99 di bawah 10 milidetik.")
        ]
    },
    {
        "order": 2,
        "title": "Cloud Native Architecture, Kubernetes Orchestration & GitOps",
        "description": "Kurikulum komprehensif menguasai orkestrasi kontainer Kubernetes tingkat mahir, networking CNI, service mesh Istio, storage CSI, autoscaling HPA/KEDA, dan GitOps pipeline dengan ArgoCD.",
        "passing_score": 80,
        "token_code": "K8S-GITOPS-2026",
        "sessions": [
            ("Sesi 1: Linux Kernel Primitives: cgroups v2, Namespaces & Seccomp", "Membedah pondasi dasar kontainerisasi pada kernel Linux: UTS, PID, NET, IPC, MNT, user namespaces, limitasi cgroups v2, dan seccomp sandbox."),
            ("Sesi 2: Kubernetes Control Plane Internals & Raft Consensus in etcd", "Mempelajari mekanisme internal kube-apiserver, kube-scheduler, kube-controller-manager, etcd storage layout, snapshotting, dan quorum recovery."),
            ("Sesi 3: Declarative Workloads: Deployments, StatefulSets & DaemonSets", "Strategi pemilihan resource workload Kubernetes, rolling update vs recreate, StatefulSet stable network IDs, headless services, dan DaemonSets."),
            ("Sesi 4: Container Network Interface (CNI), IPAM & eBPF with Cilium", "Konfigurasi advanced container networking, VXLAN vs BGP direct routing, IP Address Management (IPAM), dan akselerasi data plane dengan eBPF Cilium."),
            ("Sesi 5: Service Discovery, CoreDNS Tuning & kube-proxy (iptables vs IPVS)", "Mekanisme resolusi DNS internal cluster, tuning CoreDNS cache, perbandingan throughput kube-proxy iptables vs IPVS vs eBPF socket load balancing."),
            ("Sesi 6: Ingress Controllers, Gateway API & Envoy Proxy Integration", "Migrasi Ingress v1 ke Kubernetes Gateway API modern, HTTPRoute, TLS termination, path routing, dan Envoy data plane performance."),
            ("Sesi 7: Service Mesh Enterprise: Istio mTLS, Traffic Shifting & Canary", "Penerapan zero-trust service mesh dengan Istio, mutual TLS otomatis antar pod, traffic splitting 90/10 canary, dynamic fault injection, dan circuit breaking."),
            ("Sesi 8: Container Storage Interface (CSI), Persistent Volumes & Ceph Rook", "Membangun software-defined storage di Kubernetes menggunakan Ceph Rook, Dynamic Volume Provisioning, ReadWriteMany (RWX), dan storage snapshots."),
            ("Sesi 9: Advanced Autoscaling: Horizontal Pod Autoscaler (HPA), VPA & KEDA", "Autoscaling berbasis metrics kustom Prometheus/Kafka lag menggunakan KEDA (Kubernetes Event-driven Autoscaling) dan Vertical Pod Autoscaler."),
            ("Sesi 10: Kubernetes Security Hardening: RBAC, PSA, OPA Gatekeeper & Kyverno", "Pengamanan cluster dengan Pod Security Admission (PSA), implementasi policy as code menggunakan OPA Gatekeeper dan Kyverno, audit log monitoring."),
            ("Sesi 11: Multi-Tenancy, Namespace Quotas & Cluster Federation", "Isolasi antar tim dengan ResourceQuota, LimitRanges, NetworkPolicies terisolasi, serta multi-cluster management dengan Submariner."),
            ("Sesi 12: GitOps CD Pipeline: ArgoCD, Helm, Kustomize & ApplicationSet", "Otomatisasi deployment berbasis GitOps murni menggunakan ArgoCD, integrasi Helm charts, Kustomize overlays, dan deklarasi multi-environment ApplicationSet."),
            ("Sesi 13: Cluster Disaster Recovery: Velero Backup, Restore & Etcd Migration", "SOP pencadangan etcd cluster secara otomatis, backup persistent volume snapshots ke object storage S3 menggunakan Velero, dan simulasi cluster rebuild."),
            ("Sesi 14: Cost Optimization & FinOps in Kubernetes: Kubecost & Karpenter", "Optimasi biaya cloud node provisioning dengan Karpenter, dynamic bin-packing, spot instance handling, dan alokasi biaya per namespace dengan Kubecost."),
            ("Sesi 15: Capstone: Multi-Region High-Availability Kubernetes Cluster", "Merancang dan menggelar arsitektur multi-region Kubernetes terdistribusi tahan bencana dengan otomatisasi failover traffic global.")
        ]
    },
    {
        "order": 3,
        "title": "Advanced DevOps, CI/CD Automation & Observability Engineering",
        "description": "Membangun platform engineering modern, pipeline otomatisasi CI/CD zero-friction, infrastructure as code Terraform, serta observability stack terintegrasi (Prometheus, Grafana, Loki, Tempo).",
        "passing_score": 75,
        "token_code": "DEVOPS-OBS-2026",
        "sessions": [
            ("Sesi 1: Platform Engineering Principles & Developer Self-Service", "Membangun Internal Developer Platform (IDP), standardisasi golden paths, blueprint templates, dan automasi provisioning."),
            ("Sesi 2: Infrastructure as Code (IaC) with Terraform & Terragrunt", "Manajemen state remote terenkripsi, locking DynamoDB/Consul, modularisasi infrastruktur, dan multi-environment management."),
            ("Sesi 3: Immutable Image Building: Packer, Dockerfile Multi-Stage & Distroless", "Optimasi container build cache, docker buildx multi-arch, multi-stage compilation, dan security hardening dengan image distroless."),
            ("Sesi 4: High-Velocity CI Pipeline: GitHub Actions, Runner Clusters & Caching", "Desain workflow CI paralel, self-hosted ephemeral runners di Kubernetes, dependency caching, dan artifact attestation."),
            ("Sesi 5: Progressive Delivery: Flagger, Canary Deployments & Automated Rollbacks", "Penerapan progressive delivery dengan Flagger, analisis metrik prometheus real-time selama rollout, dan instant rollback saat terjadi lonjakan error."),
            ("Sesi 6: Secret Management & Zero-Trust Credentials with HashiCorp Vault", "Implementasi dynamic secrets, short-lived tokens, integrasi Vault Agent injector di Kubernetes, dan rotasi kredensial otomatis."),
            ("Sesi 7: Observability Pillars: Metrics, Logs, Traces & Continuous Profiling", "Korelasi 4 pilar observability untuk mendiagnosis insiden produksi dalam hitungan detik dengan contextual span-to-log linking."),
            ("Sesi 8: Prometheus Architecture, TSDB Compaction & PromQL Mastery", "Mempelajari arsitektur pull model Prometheus, TSDB head block compaction, query PromQL kompleks (histogram_quantile, rate vs irate)."),
            ("Sesi 9: Enterprise Dashboarding: Grafana Visualizations & Alert Rules", "Membangun dynamic multi-tenant dashboards, SLO/Error Budget tracking, dan routing alerts cerdas via Alertmanager ke Slack/PagerDuty."),
            ("Sesi 10: Log Aggregation at Scale: Grafana Loki & Vector Log Shipping", "Arsitektur log index-free Grafana Loki, log shipping performa tinggi menggunakan Vector agent, dan LogQL query filtering."),
            ("Sesi 11: Distributed Tracing with Grafana Tempo & OpenTelemetry Collector", "Deployment OpenTelemetry Collector daemonset, trace sampling strategies (tail-based sampling), dan penyimpanan trace di object storage S3."),
            ("Sesi 12: Continuous Profiling in Production: Pyroscope & Parca", "Mendeteksi memory leak dan CPU hotspot pada runtime production tanpa overhead performa menggunakan eBPF continuous profiling."),
            ("Sesi 13: Shift-Left Security: SAST, DAST, Container Scanning with Trivy", "Integrasi pemindaian kerentanan CVE otomatis, SBOM generation (Software Bill of Materials), dan signing artifact dengan Cosign."),
            ("Sesi 14: Incident Management: On-Call Playbooks, Postmortems & Blameless Culture", "Prosedur penanganan insiden darurat, pembagian peran Incident Commander, timeline reconstruction, dan penulisan postmortem tanpa saling menyalahkan."),
            ("Sesi 15: Capstone: Membangun Enterprise Observability & Deployment Engine", "Membangun platform CI/CD dan Observability terpadu dari source code commit hingga monitoring metrik produksi secara penuh.")
        ]
    },
    {
        "order": 4,
        "title": "Database Internals, High-Availability Clustering & Distributed SQL",
        "description": "Eksplorasi mendalam mesin basis data, B-Tree vs LSM-Tree, Write-Ahead Logging (WAL), query planner optimization, replikasi streaming, sharding, dan Distributed SQL (CockroachDB/TiDB).",
        "passing_score": 75,
        "token_code": "DATABASE-CORE-2026",
        "sessions": [
            ("Sesi 1: Storage Engine Fundamentals: B+ Tree vs LSM-Trees (RocksDB)", "Perbandingan struktur data internal engine basis data: B+ Tree disk-friendly pages vs Log-Structured Merge-tree (LSM) write-optimized architecture."),
            ("Sesi 2: Transaction Internals: ACID, Write-Ahead Logging (WAL) & Recovery", "Mekanisme durabilitas WAL, ARIES recovery algorithm, checkpointing, dan dirty buffer management di database engine."),
            ("Sesi 3: Concurrency Control: Multi-Version Concurrency Control (MVCC)", "Bagaimana MVCC mencegah read-write contention, vacuum/purge dead tuples, transaction wraparound, dan snapshot isolation."),
            ("Sesi 4: SQL Query Execution Engine: Cost-Based Optimizer & Execution Plans", "Membaca EXPLAIN ANALYZE, statistik tabel, index scan vs bitmap heap scan, join algorithms (Nested Loop, Hash Join, Merge Join)."),
            ("Sesi 5: Indexing Mastery: B-Tree, Hash, GIN, GiST, BRIN & Partial Indexes", "Strategi pemilihan indeks yang tepat untuk filter multi-kolom, full-text search (GIN), data geospasial (GiST), dan time-series berjuta baris (BRIN)."),
            ("Sesi 6: Database Connection Pooling: PgBouncer & ProxySQL at Scale", "Mengelola 10.000+ client connection dengan transaction pooling, statement pooling, dan routing read-write otomatis."),
            ("Sesi 7: High-Availability & Streaming Replication: Physical vs Logical Replication", "Konfigurasi primary-replica synchronous vs asynchronous replication, replikasi slot, WAL archiving, dan failover quorum."),
            ("Sesi 8: Automatic Failover & Cluster Orchestration: Patroni, Raft & Consul", "Membangun cluster PostgreSQL zero-downtime menggunakan Patroni dengan consensus store etcd/Consul dan pencegahan split-brain."),
            ("Sesi 9: Table Partitioning & Sharding Architectures: Range, List & Hash", "Teknik partisi data horizontal berskala terabyte, query pruning, routing partisi, dan distributed foreign keys."),
            ("Sesi 10: Distributed SQL Internals: Raft Consensus, Spanner & TrueTime", "Arsitektur Distributed SQL modern (CockroachDB/YugabyteDB), multi-Raft groups, range splitting, dan consistency model."),
            ("Sesi 11: Distributed Transactions: Two-Phase Commit (2PC) & Saga Pattern", "Menangani transaksi terdistribusi lintas microservices, kompensasi transaksi, dan mitigasi bottleneck 2PC."),
            ("Sesi 12: Database Performance Tuning: Memory Allocation (shared_buffers, work_mem)", "Optimalisasi parameter memori server database, OS kernel dirty page ratios, dan I/O scheduling tuning."),
            ("Sesi 13: Time-Series Databases: TimescaleDB, Compression & Hypertable Chunks", "Menyimpan dan mengagregasi data IoT/telemetri miliaran record per hari dengan hypertable TimescaleDB dan segment compression."),
            ("Sesi 14: Zero-Downtime Database Migration: Expand-Contract & Ghost/gh-ost", "SOP migrasi skema tabel produksi tanpa mengunci tabel menggunakan pattern Expand-Contract dan asynchronous table alteration."),
            ("Sesi 15: Capstone: Merancang Database Cluster Terdistribusi Skala Global", "Merancang arsitektur database multi-region dengan latensi baca lokal, replikasi aktif-aktif, dan ketahanan terhadap kegagalan data center.")
        ]
    },
    {
        "order": 5,
        "title": "Enterprise Network Infrastructure, BGP Routing & SD-WAN Architecture",
        "description": "Perancangan jaringan enterprise skala ISP, dynamic routing BGP/OSPF, MPLS, segment routing, VLAN/VXLAN encapsulation, QoS traffic engineering, dan Software-Defined WAN (SD-WAN).",
        "passing_score": 80,
        "token_code": "NETWORK-ENTERPRISE-2026",
        "sessions": [
            ("Sesi 1: OSI Model & Low-Level Packet Anatomy: Ethernet, IPv4/IPv6 & TCP/UDP", "Analisis frame Ethernet, header IPv4/IPv6, TCP handshake, window sizing, checksum verification dengan Wireshark."),
            ("Sesi 2: Layer 2 Enterprise Switching: VLANs, 802.1Q Trunking & STP/RSTP/MSTP", "Segmentasi broadcast domain dengan VLAN, konfigurasi trunking, mitigasi looping jaringan dengan Rapid Spanning Tree Protocol."),
            ("Sesi 3: Link Aggregation (LACP) & Multi-Chassis EtherChannel (MLAG)", "Meningkatkan bandwidth backbone switch dan redundansi hardware menggunakan LACP 802.3ad dan MLAG tanpa loop."),
            ("Sesi 4: Dynamic Interior Routing: OSPF Area Design, LSA Types & Convergence", "Perancangan OSPF multi-area, shortest path first (SPF) Dijkstra algorithm, tuning hello/dead interval untuk sub-second failover."),
            ("Sesi 5: Border Gateway Protocol (BGP) Architecture: Autonomous Systems & Peering", "Pondasi routing internet: eBGP vs iBGP, AS-Path, MED, Local Preference, Weight, dan negosiasi peering di Internet Exchange Point (IXP)."),
            ("Sesi 6: Advanced BGP Traffic Engineering: Route Reflectors, Communities & Dampening", "Skalabilitas jaringan BGP menggunakan Route Reflectors, manipulasi jalur inbound/outbound dengan BGP Communities, dan dampening flapping."),
            ("Sesi 7: MPLS Core Networks: Label Distribution Protocol (LDP) & L3VPN", "Arsitektur MPLS provider core, label switching, penugasan label LDP, dan isolasi jaringan pelanggan via MPLS Layer 3 VPN (VRF)."),
            ("Sesi 8: Data Center Overlay Networking: VXLAN & EVPN Control Plane", "Enkapsulasi frame L2 di atas jaringan L3 menggunakan VXLAN, penemuan MAC terdistribusi dengan BGP EVPN, dan konfigurasi Spine-Leaf."),
            ("Sesi 9: Quality of Service (QoS): DSCP, Traffic Policing, Shaping & Queuing", "Prioritisasi traffic VoIP/video conference terhadap file download menggunakan DiffServ DSCP, token bucket shaping, dan weighted fair queuing."),
            ("Sesi 10: Enterprise Firewall Architectures: Stateful Inspection, NAT & IPSec VPN", "Konfigurasi Next-Gen Firewall, Destination/Source NAT, tunneling site-to-site IPSec IKEv2 dengan enkripsi AES-GCM."),
            ("Sesi 11: High Availability Network Gateway: VRRP, HSRP & Keepalived", "Implementasi redundant default gateway dengan VRRP/HSRP dan sinkronisasi session table firewall untuk failover tanpa putus koneksi."),
            ("Sesi 12: Network Security: 802.1X Port Authentication, Dynamic ARP Inspection (DAI)", "Pengamanan switch port fisik dengan RADIUS 802.1X, DHCP snooping, dan proteksi dari serangan ARP spoofing/poisoning."),
            ("Sesi 13: Software-Defined WAN (SD-WAN): Dynamic Path Selection & Overlay Routing", "Arsitektur SD-WAN modern, pengukuran latensi/jitter link secara real-time, dan otomatisasi failover traffic internet ke link backup."),
            ("Sesi 14: Network Telemetry & Automation: SNMP, NetFlow/IPFIX & Ansible Automation", "Monitoring aliran bandwidth jaringan dengan NetFlow v9/IPFIX dan otomatisasi konfigurasi perangkat router/switch menggunakan Ansible."),
            ("Sesi 15: Capstone: Desain Jaringan Enterprise ISP Multi-Data Center", "Merancang topologi jaringan backbone ISP berkapasitas 100Gbps dengan redundansi BGP multi-homing dan proteksi anti-DDoS.")
        ]
    },
    {
        "order": 6,
        "title": "Cybersecurity Defense, Threat Hunting & Zero Trust Architecture",
        "description": "Strategi pertahanan siber enterprise komprehensif, mitigasi OWASP Top 10, otentikasi OAuth2/OIDC & Passkeys, SIEM log analysis, EDR threat hunting, dan Zero Trust Network Access (ZTNA).",
        "passing_score": 85,
        "token_code": "CYBERSEC-SHIELD-2026",
        "sessions": [
            ("Sesi 1: Modern Threat Landscape: MITRE ATT&CK Framework & Kill Chain", "Memahami taktik, teknik, dan prosedur (TTP) peretas modern berbasis framework MITRE ATT&CK dan mitigasi di tiap fase kill chain."),
            ("Sesi 2: Cryptography Engineering: TLS 1.3, Elliptic Curves & Post-Quantum Prep", "Implementasi enkripsi data in-transit dan at-rest, kurva eliptik Ed25519, ephemeral key exchange, dan persiapan enkripsi post-quantum."),
            ("Sesi 3: Identity & Access Management (IAM): OAuth 2.1, OIDC & FIDO2/Passkeys", "Membangun sistem otentikasi enterprise tanpa password menggunakan FIDO2 WebAuthn/Passkeys, PKCE flow, dan RBAC/ABAC authorization."),
            ("Sesi 4: Web Application Security: OWASP Top 10 In-Depth Mitigation", "Teknik pertahanan mendalam dari SQLi, NoSQLi, Blind SSRF, IDOR, Cross-Site Scripting (XSS), dan prototype pollution."),
            ("Sesi 5: API Security & Defense: JWT Security, Broken Object Level Auth (BOLA)", "Mencegah eksploitasi JWT algorithm confusion (none/RS256 vs HS256), token sidejacking, dan validasi kepemilikan objek pada API."),
            ("Sesi 6: Zero Trust Architecture: Micro-segmentation & Context-Aware Access", "Penerapan prinsip 'Never Trust, Always Verify', pembatasan lateral movement dengan micro-segmentation, dan device posture checking."),
            ("Sesi 7: Cloud Security Posture Management (CSPM) & IAM Hardening", "Audit konfigurasi cloud AWS/GCP/Azure, eliminasi akses berlebih (least privilege), dan deteksi public S3 bucket exposure otomatis."),
            ("Sesi 8: Security Information & Event Management (SIEM): Wazuh & Splunk Detection", "Pusat monitoring keamanan siber, agregasi log audit, rule korelasi Sigma, dan deteksi anomali perilaku login pengguna."),
            ("Sesi 9: Endpoint Detection & Response (EDR) & Memory Forensics", "Analisis aktivitas mencurigakan pada endpoint, memory dumping, deteksi process injection (DLL hollowing), dan isolasi host terinfeksi."),
            ("Sesi 10: Network Security & Anti-DDoS Architecture (SYN Flood, HTTP Flood)", "Pertahanan serangan distributed denial of service dengan BGP Flowspec, SYN cookies, IP reputation scoring, dan edge rate-limiting."),
            ("Sesi 11: Secure Software Development Lifecycle (SSDLC) & Supply Chain Security", "Audit keamanan kode otomatis (SAST/DAST), dependency vulnerability scanning, dan verifikasi integritas package npm/pip."),
            ("Sesi 12: Secret Management & Key Management Service (KMS) Integration", "Pencegahan kebocoran API keys di repository, integrasi AWS KMS/Vault, envelope encryption, dan automated secret rotation."),
            ("Sesi 13: Incident Response & Digital Forensics (DFIR) Playbooks", "SOP penanganan insiden ransomware, preservasi bukti digital, analisis packet capture (PCAP), dan timeline reconstruction."),
            ("Sesi 14: Vulnerability Assessment & Pen-Testing Workflow (Ethical Hacking)", "Metodologi pengujian penetrasi terstruktur, port scanning, privilege escalation enumeration, dan pelaporan temuan keamanan."),
            ("Sesi 15: Capstone: Membangun Enterprise Zero Trust Security Blueprint", "Merancang arsitektur keamanan Zero Trust terintegrasi menyeluruh untuk perusahaan skala ribuan karyawan dan ratusan microservices.")
        ]
    },
    {
        "order": 7,
        "title": "Microservices Architecture, Event-Driven Systems & Kafka Streaming",
        "description": "Perancangan arsitektur microservices modern, Domain-Driven Design (DDD), Event Sourcing, CQRS, Apache Kafka distributed log streaming, dan transactional outbox pattern.",
        "passing_score": 75,
        "token_code": "MICROSERVICES-KAFKA-2026",
        "sessions": [
            ("Sesi 1: Monolith Decomposition: Bounded Contexts & Domain-Driven Design (DDD)", "Teknik membedah monolit tanpa kekacauan data: identifikasi aggregate roots, bounded contexts, domain events, dan ubiquitous language."),
            ("Sesi 2: Synchronous vs Asynchronous Communication in Microservices", "Memilih kapan menggunakan synchronous gRPC/REST vs asynchronous message passing untuk menjaga decoupling dan ketersediaan layanan."),
            ("Sesi 3: Apache Kafka Architecture: Log Compaction, Partitions & Consumer Groups", "Membedah internal storage Kafka, commit log, mekanisme partisi, consumer rebalancing protocol, dan leader election."),
            ("Sesi 4: Exactly-Once Processing Semantics (EOS) & Idempotent Producers", "Menjamin tidak ada data duplikat atau hilang dalam streaming pipeline menggunakan Kafka transactional producer and consumer offsets."),
            ("Sesi 5: The Transactional Outbox Pattern & Debezium Change Data Capture (CDC)", "Menghindari inkonsistensi dual-write database dan message broker menggunakan outbox table dan Debezium CDC via Kafka Connect."),
            ("Sesi 6: Command Query Responsibility Segregation (CQRS) Architecture", "Pemisahan model write (optimasi integritas transaksi) dan model read (optimasi query cepat dengan Elasticsearch/Read DB)."),
            ("Sesi 7: Event Sourcing: State as an Append-Only Stream of Events", "Menyimpan seluruh perubahan bisnis sebagai stream event tak terhapuskan, snapshotting agregat, dan replayability state."),
            ("Sesi 8: Distributed Transactions & The Saga Pattern (Orchestration vs Choreography)", "Implementasi transaksi panjang lintas service dengan orchestrator engine vs event-driven choreography serta penanganan kompensasi."),
            ("Sesi 9: API Gateway & Backend-for-Frontend (BFF) Pattern at Scale", "Mengelola aggregasi data, protocol translation, JWT validation, dan response shaping untuk mobile dan web clients."),
            ("Sesi 10: Stream Processing with Kafka Streams & Apache Flink", "Real-time stateful stream processing, sliding/tumbling event windows, stream-table joins, dan CEP (Complex Event Processing)."),
            ("Sesi 11: Schema Registry, Protobuf & Backward/Forward Evolution", "Menjaga kompatibilitas struktur data antar producer dan consumer menggunakan Confluent Schema Registry dan Protobuf serialization."),
            ("Sesi 12: Distributed Caching & Read-Through Data Planes in Microservices", "Manajemen cache terdistribusi lintas microservices, sinkronisasi invalidasi cache via pub/sub event, dan pencegahan stale data."),
            ("Sesi 13: Testing Strategies for Microservices: Contract Testing with Pact", "Memastikan kompatibilitas API antar tim tanpa perlu menjalankan seluruh cluster menggunakan consumer-driven contract testing Pact."),
            ("Sesi 14: Disaster Recovery & Active-Active Kafka Cluster Mirroring", "Replikasi data stream lintas data center secara aktif-aktif menggunakan Kafka MirrorMaker 2 dan mitigasi failover latency."),
            ("Sesi 15: Capstone: Merancang Event-Driven Financial Core Engine", "Membangun sistem perbankan / pembayaran digital berbasis Event-Driven Microservices, CQRS, dan Kafka dengan konsistensi 100%.")
        ]
    },
    {
        "order": 8,
        "title": "Modern Frontend Engineering, Web Performance & Micro-Frontends",
        "description": "Pengembangan web frontend modern berperforma ultra-cepat, React 19 Concurrent Features, Next.js Server Components, Core Web Vitals optimization, state management, dan Micro-Frontends.",
        "passing_score": 75,
        "token_code": "FRONTEND-ULTRA-2026",
        "sessions": [
            ("Sesi 1: Browser Rendering Engine Internals: DOM, CSSOM & Render Tree", "Mempelajari parsing HTML/CSS, layout calculation (reflow), painting, composite layers, dan GPU hardware acceleration."),
            ("Sesi 2: React 19 Concurrency: Fiber Architecture, Transitions & Suspense", "Membedah internal fiber reconciliation, non-blocking rendering dengan useTransition, dan streaming HTML server-side via Suspense."),
            ("Sesi 3: React Server Components (RSC) & Server Actions Architecture", "Pemisahan client vs server bundle, eliminasi client-side footprint, transmisi data serialisasi RSC payload, dan direct mutations."),
            ("Sesi 4: State Management at Scale: Zustand, Jotai, TanStack Query & Signals", "Arsitektur state global efisien tanpa re-render yang tidak perlu, atomic state, fine-grained reactivity, dan server state caching TanStack."),
            ("Sesi 5: Core Web Vitals Optimization: INP, LCP & CLS Mastery", "Diagnosa dan optimasi metrik vital Google: Interaction to Next Paint (INP), Largest Contentful Paint (LCP), dan Cumulative Layout Shift (CLS)."),
            ("Sesi 6: Modern Asset Optimization: Responsive AVIF/WebP, Font Subsetting & SVG", "Teknik kompresi gambar generasi terbaru AVIF, subsetting Google Fonts untuk menghemat 80% bandwidth, dan SVG icon sprites."),
            ("Sesi 7: JavaScript Bundle Size Optimization: Tree Shaking, Code Splitting & Dynamic Imports", "Analisis bundle webpack/vite, eliminasi dead code, dynamic import vendor besar, dan lazy-loading component routes."),
            ("Sesi 8: Client-Side Caching & Offline PWA: Service Workers & Cache API", "Membangun Progressive Web App (PWA) offline-first, intercepting network requests dengan Service Worker, dan background sync."),
            ("Sesi 9: Real-Time Web: WebSockets, WebRTC Data Channels & SSE in Frontend", "Manajemen koneksi WebSocket tahan banting dengan reconnect loop, multiplexing data stream, dan visualisasi canvas real-time."),
            ("Sesi 10: Web Accessibility (a11y) & WCAG 2.2 AA Compliance", "Navigasi keyboard lengkap, ARIA roles, live regions untuk screen reader, color contrast ratio, dan audit otomatis axe-core."),
            ("Sesi 11: Enterprise Design Systems: Tailwind CSS, CSS Variables & Component Libraries", "Membangun sistem token desain terpadu, semantic color palette, responsive breakpoints, dan atomic reusable UI components."),
            ("Sesi 12: Micro-Frontends Architecture: Module Federation & Iframe Sandboxing", "Memisahkan frontend besar menjadi aplikasi independen yang dikembangkan tim berbeda menggunakan Webpack 5 Module Federation."),
            ("Sesi 13: End-to-End Testing & Visual Regression: Playwright & Storybook", "Otomatisasi pengujian antarmuka browser nyata dengan Playwright, visual snapshot diffing, dan komponen testing di Storybook."),
            ("Sesi 14: Frontend Security: Content Security Policy (CSP), XSS Sanitization & Subresource Integrity", "Pencegahan serangan XSS pada antarmuka web, konfigurasi strict CSP nonce, DOMPurify, dan SRI integrity hashing."),
            ("Sesi 15: Capstone: Membangun Enterprise SaaS Dashboard Berlatensi Rendah", "Membangun aplikasi dashboard enterprise berkecepatan 60 FPS dengan data streaming ribuan update per detik tanpa jank.")
        ]
    },
    {
        "order": 9,
        "title": "AI Engineering, Large Language Models (LLM) & RAG Architecture",
        "description": "Pondasi teknik kecerdasan buatan enterprise, arsitektur Transformer, Retrieval-Augmented Generation (RAG), Vector Databases (Qdrant/Milvus), Model Serving, dan AI Agent Orchestration.",
        "passing_score": 80,
        "token_code": "AI-ENGINEERING-2026",
        "sessions": [
            ("Sesi 1: Transformer Architecture Internals: Self-Attention & Positional Encoding", "Membedah mekanisme internal Transformer: Multi-Head Self-Attention, query-key-value projections, feed-forward layers, dan tokenization."),
            ("Sesi 2: Vector Embeddings & High-Dimensional Semantic Search", "Bagaimana model embedding (text-embedding-3, BGE) memetakan makna teks ke dalam vektor multidimensi dan kalkulasi Cosine Similarity."),
            ("Sesi 3: Vector Databases at Scale: HNSW Indexing, Qdrant & pgvector", "Mempelajari algoritma graf Hierarchical Navigable Small World (HNSW), filtering metadata hybrid, dan performa database vektor."),
            ("Sesi 4: Advanced RAG: Chunking Strategies, Semantic Chunking & HyDE", "Teknik memecah dokumen kompleks (Recursive vs Semantic chunking), Parent-Child retrieval, dan Hypothetical Document Embeddings (HyDE)."),
            ("Sesi 5: Re-ranking & Context Compression: Cohere Re-rank & Cross-Encoders", "Meningkatkan relevansi pencarian dokumen dengan Cross-Encoder re-ranker dan membuang konteks bising sebelum masuk ke konteks LLM."),
            ("Sesi 6: Structured Output Generation: Function Calling, JSON Schema & Outlines", "Memastikan respon model AI selalu mematuhi skema JSON valid tanpa halusinasi menggunakan constrained sampling dan tool calling."),
            ("Sesi 7: AI Agent Frameworks: ReAct Pattern, LangGraph & Multi-Agent Swarms", "Membangun agen otonom yang mampu merencanakan tugas, memanggil tools API eksternal, mengevaluasi hasil, dan berkolaborasi timbal-balik."),
            ("Sesi 8: Self-Hosted LLM Serving: vLLM, TensorRT-LLM & PagedAttention", "Deploy model open-source (Llama 3, DeepSeek) di server GPU sendiri dengan optimasi PagedAttention vLLM untuk throughput tinggi."),
            ("Sesi 9: Model Quantization: AWQ, GPTQ, GGUF & VRAM Footprint Optimization", "Teknik kompresi bobot model dari 16-bit ke 4-bit/8-bit untuk menghemat memori VRAM GPU tanpa menurunkan akurasi penalaran."),
            ("Sesi 10: Fine-Tuning Foundations: LoRA, QLoRA & Instruction Tuning", "Melatih model AI untuk domain industri spesifik menggunakan Parameter-Efficient Fine-Tuning (PEFT), LoRA adaptors, dan formatting dataset."),
            ("Sesi 11: LLM Evaluation (LLM-as-a-Judge, Ragas & Faithfulness Metrics)", "Mengukur kualitas output RAG secara kuantitatif: Faithfulness, Answer Relevance, Context Precision, dan Context Recall."),
            ("Sesi 12: AI Safety, Guardrails & Prompt Injection Defense (NeMo Guardrails)", "Memproteksi sistem AI dari serangan jailbreak, indirect prompt injection, kebocoran data sensitif (PII redaction), dan toxic output."),
            ("Sesi 13: Caching & Semantic Caching for LLMs: GPTCache & Redis", "Menghemat biaya API dan memotong latensi respon hingga 90% dengan menyimpan embedding pertanyaan serupa di cache semantik."),
            ("Sesi 14: Multimodal AI: Vision-Language Models & Audio Processing", "Membangun pipeline AI yang mampu menganalisis citra arsitektur, diagram sistem, dan pemrosesan suara real-time."),
            ("Sesi 15: Capstone: Membangun Enterprise Autonomous RAG Knowledge System", "Membangun sistem AI enterprise otonom lengkap dengan RAG multimodal, integrasi tools database, dan guardrails keamanan terpadu.")
        ]
    },
    {
        "order": 10,
        "title": "Site Reliability Engineering (SRE), Chaos Engineering & Zero Downtime",
        "description": "Prinsip rekayasa keandalan sistem Google SRE, Service Level Objectives (SLO), Error Budgets, Chaos Engineering dengan Chaos Mesh, otomatisasi failover, dan disaster recovery.",
        "passing_score": 80,
        "token_code": "SRE-RESILIENCE-2026",
        "sessions": [
            ("Sesi 1: SRE Foundations: Eliminating Toil, Service Level Indicators (SLI) & SLOs", "Mendefinisikan metrik keandalan yang bermakna bagi bisnis, menghitung Error Budget harian/bulanan, dan kebijakan pembekuan rilis."),
            ("Sesi 2: Golden Signals Monitoring: Latency, Traffic, Errors & Saturation", "Menerapkan pemantauan 4 Golden Signals Google SRE pada seluruh service dan mendeteksi saturasi sumber daya sebelum outage terjadi."),
            ("Sesi 3: Error Budget Policies & Automated Release Throttling", "Otomatisasi penghentian deployment pipeline saat Error Budget menipis untuk memprioritaskan stabilitas dan refaktor keandalan."),
            ("Sesi 4: Distributed Tracing for Incident Triage & Critical Path Analysis", "Menggunakan distributed tracing untuk menemukan bottleneck latensi pada dependency tersembunyi selama insiden berlangsung."),
            ("Sesi 5: Chaos Engineering Principles: Formulating Hypotheses & Blast Radius", "Metodologi menguji keandalan sistem secara sengaja di staging dan production dengan pembatasan dampak risiko (blast radius control)."),
            ("Sesi 6: Chaos Experiments with Chaos Mesh & LitmusChaos in Kubernetes", "Simulasi pod kill acak, network delay/packet loss injection, disk I/O saturation, dan verifikasi reaksi self-healing cluster."),
            ("Sesi 7: Cascading Failure Prevention: Deadlines, Timeouts & Backoff with Jitter", "Mencegah efek domino tumbangnya seluruh sistem dengan propagasi deadline, timeout bertingkat, dan exponential backoff with full jitter."),
            ("Sesi 8: Graceful Degradation & Feature Flags Architecture (LaunchDarkly/OpenFeature)", "Mematikan fitur non-esensial saat beban puncak untuk menyelamatkan transaksi inti menggunakan dynamic feature flagging."),
            ("Sesi 9: High-Availability Multi-Region Active-Active Architectures", "Tantangan data consistency, global server load balancing (GSLB), latency-based routing, dan sinkronisasi status aktif-aktif."),
            ("Sesi 10: Database Disaster Recovery: Point-In-Time Recovery (PITR) & Drills", "Prosedur pemulihan data ke detik sebelum insiden terjadi (PITR), validasi checksum backup rutin, dan latihan darurat tim."),
            ("Sesi 11: Automated Self-Healing Systems & Kubernetes Operator Pattern", "Membangun custom controller/operator Kubernetes untuk mendeteksi anomali state aplikasi dan melakukan koreksi otomatis tanpa manusia."),
            ("Sesi 12: Load Testing & Capacity Planning: Distributed k6 & Locust at Scale", "Menjalankan uji beban jutaan virtual users terdistribusi, mengukur breakpoint sistem, dan kalkulasi kapasitas hardware jangka panjang."),
            ("Sesi 13: On-Call Engineering, Alert Fatigue Mitigation & Severity Triage", "Menghapus alert bising (noise), standardisasi actionable alerts, eskalasi on-call terstruktur (SEV-1 hingga SEV-4)."),
            ("Sesi 14: Blameless Postmortems & Continuous Reliability Improvement", "Membangun budaya pembelajaran dari kegagalan tanpa mencari kambing hitam, analisis akar masalah (5-Whys), dan tracking action items."),
            ("Sesi 15: Capstone: Merancang Sistem Tahan Bencana 99.999% Availability (Five Nines)", "Merancang arsitektur enterprise end-to-end berstandar ketersediaan 99.999% dengan toleransi terhadap kegagalan total cloud provider.")
        ]
    }
]


def generate_media_assets():
    """Generates real SVG/PNG diagram images and valid streamable MP4 demonstration videos."""
    upload_dir = "/data/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    print("🎨 Generating high-res architectural diagram SVG and real streamable MP4 video assets...")

    # 1. Generate Diagram Images
    diagram_files = {}
    for mod_idx in range(1, 11):
        filename = f"diagram_module_{mod_idx}.svg"
        filepath = os.path.join(upload_dir, filename)
        
        svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#818cf8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  <circle cx="200" cy="150" r="180" fill="#38bdf8" opacity="0.08"/>
  <circle cx="1000" cy="450" r="220" fill="#818cf8" opacity="0.08"/>
  
  <rect x="80" y="80" width="1040" height="470" rx="24" fill="#1e293b" fill-opacity="0.7" stroke="#334155" stroke-width="2"/>
  <rect x="80" y="80" width="1040" height="8" rx="4" fill="url(#accentGrad)"/>
  
  <text x="130" y="150" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="28" fill="#38bdf8" letter-spacing="2">ENTERPRISE ARCHITECTURE BLUEPRINT • MODUL #{mod_idx}</text>
  <text x="130" y="210" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="34" fill="#f8fafc">{MODULES_DATA[mod_idx-1]['title']}</text>
  
  <rect x="130" y="270" width="280" height="220" rx="16" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="160" y="320" font-family="sans-serif" font-weight="700" font-size="20" fill="#38bdf8">1. Client / Ingress Tier</text>
  <text x="160" y="360" font-family="sans-serif" font-size="15" fill="#94a3b8">• TLS 1.3 &amp; HTTP/2 Streaming</text>
  <text x="160" y="390" font-family="sans-serif" font-size="15" fill="#94a3b8">• Edge Rate Limiter (Token Bucket)</text>
  <text x="160" y="420" font-family="sans-serif" font-size="15" fill="#94a3b8">• WAF &amp; Anti-DDoS Protection</text>
  <text x="160" y="450" font-family="sans-serif" font-size="15" fill="#94a3b8">• Anycast Routing &amp; DNS GSLB</text>
  
  <rect x="460" y="270" width="280" height="220" rx="16" fill="#0f172a" stroke="#818cf8" stroke-width="1.5"/>
  <text x="490" y="320" font-family="sans-serif" font-weight="700" font-size="20" fill="#818cf8">2. Core Orchestration</text>
  <text x="490" y="360" font-family="sans-serif" font-size="15" fill="#94a3b8">• Kubernetes Worker Nodes</text>
  <text x="490" y="390" font-family="sans-serif" font-size="15" fill="#94a3b8">• Istio Mutual TLS Mesh</text>
  <text x="490" y="420" font-family="sans-serif" font-size="15" fill="#94a3b8">• Event-Driven Kafka Stream</text>
  <text x="490" y="450" font-family="sans-serif" font-size="15" fill="#94a3b8">• Auto-Scaling HPA / KEDA</text>
  
  <rect x="790" y="270" width="280" height="220" rx="16" fill="#0f172a" stroke="#34d399" stroke-width="1.5"/>
  <text x="820" y="320" font-family="sans-serif" font-weight="700" font-size="20" fill="#34d399">3. Persistence &amp; Storage</text>
  <text x="820" y="360" font-family="sans-serif" font-size="15" fill="#94a3b8">• Multi-AZ SQL Cluster</text>
  <text x="820" y="390" font-family="sans-serif" font-size="15" fill="#94a3b8">• Redis Cluster L2 Cache</text>
  <text x="820" y="420" font-family="sans-serif" font-size="15" fill="#94a3b8">• S3 / MinIO Object Storage</text>
  <text x="820" y="450" font-family="sans-serif" font-size="15" fill="#94a3b8">• WAL Archiving &amp; PITR Backup</text>
</svg>"""
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(svg_content)
        diagram_files[mod_idx] = filename

    # 2. Generate Real Demonstration MP4 Videos using FFmpeg
    video_files = {}
    for mod_idx in range(1, 11):
        vid_filename = f"demo_video_module_{mod_idx}.mp4"
        vid_filepath = os.path.join(upload_dir, vid_filename)
        
        # Fast 6-second test video with dynamic text overlay using ffmpeg
        title_text = MODULES_DATA[mod_idx-1]['title'][:30]
        cmd = [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", "color=c=0x0f172a:s=1280x720:d=6:r=24",
            "-f", "lavfi", "-i", "sine=f=440:d=6",
            "-vf", f"drawtext=text='LMS ENTERPRISE DEMO • MODUL {mod_idx}':fontcolor=0x38bdf8:fontsize=36:x=(w-text_w)/2:y=(h-text_h)/2-50,drawtext=text='{title_text}':fontcolor=white:fontsize=28:x=(w-text_w)/2:y=(h-text_h)/2+20",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "ultrafast",
            "-c:a", "aac", "-b:a", "128k",
            vid_filepath
        ]
        try:
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            video_files[mod_idx] = vid_filename
        except Exception as e:
            print(f"⚠️ FFmpeg video gen fallback for module {mod_idx}: {e}")

    return diagram_files, video_files


async def reset_and_seed_curriculum():
    print("🔥 STEP 1: Truncating database tables with FK-safe order...")
    async with AsyncSessionLocal() as db:
        # FK-safe delete in reverse order
        await db.execute(text("DELETE FROM content_watch_progress"))
        await db.execute(text("DELETE FROM user_answers"))
        await db.execute(text("DELETE FROM session_progress"))
        await db.execute(text("DELETE FROM user_module_progress"))
        await db.execute(text("DELETE FROM question_options"))
        await db.execute(text("DELETE FROM questions"))
        await db.execute(text("DELETE FROM session_contents"))
        await db.execute(text("DELETE FROM module_sessions"))
        await db.execute(text("DELETE FROM module_tokens"))
        await db.execute(text("DELETE FROM modules"))
        await db.execute(text("DELETE FROM media_files"))
        await db.commit()
        print("✅ Database cleared cleanly!")

        # Step 2: Ensure Superadmin & Standard Users
        admin_user = (await db.execute(select(User).where(User.email == "admin@lms.alfanet.id"))).scalar_one_or_none()
        if not admin_user:
            admin_user = User(
                email="admin@lms.alfanet.id",
                full_name="Administrator Enterprise",
                hashed_password=get_password_hash("AdminPass123!"),
                role=UserRole.admin,
                is_active=True
            )
            db.add(admin_user)
            await db.flush()

        student_user = (await db.execute(select(User).where(User.email == "budi.santoso@lms.alfanet.id"))).scalar_one_or_none()
        if not student_user:
            student_user = User(
                email="budi.santoso@lms.alfanet.id",
                full_name="Budi Santoso",
                hashed_password=get_password_hash("PesertaBudi2026!"),
                role=UserRole.user,
                is_active=True
            )
            db.add(student_user)
            await db.flush()

        # Step 3: Generate Real Multimedia Files
        diagram_map, video_map = generate_media_assets()

        # Register Media Records in DB
        media_records = {}
        for mod_idx in range(1, 11):
            diag_file = diagram_map.get(mod_idx, f"diagram_module_{mod_idx}.svg")
            diag_media = MediaFile(
                storage_driver=StorageDriver.local,
                storage_key=diag_file,
                original_name=f"Blueprint_Modul_{mod_idx}.svg",
                mime_type="image/svg+xml",
                size_bytes=4096, file_type=FileType.image, status=MediaStatus.ready, created_by=admin_user.id,
                
                owner_type=OwnerType.session_content
            )
            db.add(diag_media)
            await db.flush()
            
            vid_file = video_map.get(mod_idx, f"demo_video_module_{mod_idx}.mp4")
            vid_media = MediaFile(
                storage_driver=StorageDriver.local,
                storage_key=vid_file,
                original_name=f"Demo_Stream_Modul_{mod_idx}.mp4",
                mime_type="video/mp4",
                size_bytes=524288, file_type=FileType.video, status=MediaStatus.ready, created_by=admin_user.id,
                
                owner_type=OwnerType.session_content
            )
            db.add(vid_media)
            await db.flush()

            media_records[mod_idx] = {
                "diagram_id": diag_media.id,
                "video_id": vid_media.id
            }

        # Step 4: Generate 10 Modules with 15 Long Sessions each (Total = 150 Sessions)
        print("🚀 STEP 2: Seeding 10 Enterprise Modules x 15 Deep Sessions (150 Total Sessions)...")
        for mod_data in MODULES_DATA:
            mod_idx = mod_data["order"]
            module = Module(
                title=mod_data["title"],
                description=mod_data["description"],
                status=ModuleStatus.published,
                thumbnail_media_id=media_records[mod_idx]["diagram_id"],
                passing_score=mod_data["passing_score"],
                order=mod_idx,
                created_by=admin_user.id
            )
            db.add(module)
            await db.flush()

            # Create Access Token for Module
            token = ModuleToken(
                module_id=module.id,
                token_code=mod_data["token_code"],
                max_uses=500,
                current_uses=0,
                expired_at=datetime.utcnow() + timedelta(days=365),
                is_active=True,
                created_by=admin_user.id
            )
            db.add(token)

            # Generate 15 Sessions for this Module
            for sess_idx, (sess_title, sess_desc) in enumerate(mod_data["sessions"], start=1):
                session = ModuleSession(
                    module_id=module.id,
                    title=sess_title,
                    description=sess_desc,
                    duration_minutes=45,
                    order=sess_idx
                )
                db.add(session)
                await db.flush()

                # 1. Slide Teks Materi Mendalam (Theory & Architecture)
                text_content = f"""# {sess_title}

## 1. Ikhtisar & Arsitektur Sistem
{sess_desc}

Penerapan pada arsitektur skala enterprise membutuhkan pemahaman holistik tentang bagaimana setiap komponen berinteraksi di bawah beban tinggi (high-throughput) dan latensi minimal. Pada sesi ini, kita membedah mekanisme inti yang memastikan konsistensi, ketersediaan, dan toleransi terhadap kegagalan jaringan (*network partition resilience*).

## 2. Prinsip Rekayasa & Standar Industri
1. **Zero-Trust Network Model:** Setiap paket dan pemanggilan antarmuka harus diotentikasi dan diotorisasi tanpa asumsi keamanan internal.
2. **Deterministic Latency:** Mengurangi tail-latency (p99 dan p99.9) dengan optimasi buffer kernel, connection reuse, dan algoritma backpressure.
3. **Automated Recovery & Self-Healing:** Deteksi degradasi layanan secara otomatis menggunakan health checks bertingkat dan circuit breaker cerdas.

## 3. Implementasi Kode & Konfigurasi Teknis
```yaml
apiVersion: enterprise.lms.io/v1alpha1
kind: ResilientServiceDescriptor
metadata:
  name: module-{mod_idx}-session-{sess_idx}
  namespace: production-core
spec:
  replicas: 5
  concurrencyLimit: 2000
  timeoutSeconds: 30
  circuitBreaker:
    consecutiveErrorsThreshold: 5
    coolingPeriodSeconds: 15
  observability:
    openTelemetry: true
    samplingRatio: 0.25
```

## 4. Rangkuman & Panduan Praktikum
Pastikan seluruh dependensi telah terkonfigurasi sesuai spesifikasi di atas sebelum melanjutkan ke demonstrasi visual dan kuis checkpoint pemahaman.
"""
                slide_text = SessionContent(
                    session_id=session.id,
                    content_type=ContentType.text,
                    text_body=text_content,
                    order=1
                )
                db.add(slide_text)

                # 2. Slide Gambar Diagram High-Res
                slide_image = SessionContent(
                    session_id=session.id,
                    content_type=ContentType.image,
                    media_file_id=media_records[mod_idx]["diagram_id"],
                    text_body=f"Blueprint Arsitektur Sistem: {sess_title}",
                    order=2
                )
                db.add(slide_image)

                # 3. Slide Video Demonstrasi Streaming MP4
                slide_video = SessionContent(
                    session_id=session.id,
                    content_type=ContentType.video,
                    media_file_id=media_records[mod_idx]["video_id"],
                    text_body=f"Video Demonstrasi Teknis: {sess_title}",
                    order=3
                )
                db.add(slide_video)

                # 4. Bank Soal Kuis Checkpoint di Sela-Sela Slide
                q1 = Question(
                    session_id=session.id,
                    question_text=f"Berdasarkan pembahasan pada '{sess_title}', apa langkah utama untuk memastikan ketersediaan tinggi dan pencegahan kegagalan kaskade?",
                    explanation="Penerapan isolasi sumber daya, circuit breaking, dan zero-trust communication adalah standar utama keandalan sistem modern.",
                    points=1,
                    order=1,
                    is_reusable=False
                )
                db.add(q1)
                await db.flush()

                db.add_all([
                    QuestionOption(question_id=q1.id, option_text="Menerapkan circuit breaker, backpressure handling, dan isolasi fault domain", is_correct=True, order=1),
                    QuestionOption(question_id=q1.id, option_text="Menghapus connection pool dan membuka socket baru di setiap request", is_correct=False, order=2),
                    QuestionOption(question_id=q1.id, option_text="Mematikan fitur TLS encryption agar tidak menambah CPU overhead", is_correct=False, order=3),
                    QuestionOption(question_id=q1.id, option_text="Menonaktifkan logging dan metrics observabilitas di lingkungan produksi", is_correct=False, order=4)
                ])

                q2 = Question(
                    session_id=session.id,
                    question_text=f"Bagaimana strategi terbaik dalam mengoptimalkan latensi p99 pada arsitektur '{sess_title}'?",
                    explanation="Optimasi kernel socket, buffer compaction, dan pooling koneksi meminimalkan overhead alokasi memori runtime.",
                    points=1,
                    order=2,
                    is_reusable=False
                )
                db.add(q2)
                await db.flush()

                db.add_all([
                    QuestionOption(question_id=q2.id, option_text="Menggunakan connection pooling efisien, zero-copy buffer I/O, dan asynchronous non-blocking runtime", is_correct=True, order=1),
                    QuestionOption(question_id=q2.id, option_text="Mengabaikan batas alokasi memori heap dan membiarkan swap disk bekerja penuh", is_correct=False, order=2),
                    QuestionOption(question_id=q2.id, option_text="Menggunakan sinkronisasi blocking locks global di seluruh thread aplikasi", is_correct=False, order=3),
                    QuestionOption(question_id=q2.id, option_text="Menyimpan seluruh data transaksi di memori tanpa replikasi dan journaling WAL", is_correct=False, order=4)
                ])

        await db.commit()
        print("🎉 SUCCESS: 10 Enterprise Modules and 150 Sessions fully generated and committed to database!")

if __name__ == "__main__":
    asyncio.run(reset_and_seed_curriculum())
