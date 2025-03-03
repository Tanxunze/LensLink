-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: lenslink
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `photographer_id` bigint unsigned NOT NULL,
  `service_id` bigint unsigned NOT NULL,
  `booking_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time DEFAULT NULL,
  `location` text,
  `notes` text,
  `status` enum('pending','confirmed','completed','cancelled','rescheduled') DEFAULT 'pending',
  `total_amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `photographer_id` (`photographer_id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`photographer_id`) REFERENCES `photographer_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,13,6,10,'2025-03-15','14:00:00','16:00:00','Hyde Park, London','Family of 5, including toddler','confirmed',350.00,'2025-02-26 11:00:00','2025-02-26 11:10:00'),(2,14,7,12,'2025-06-22','10:00:00','22:00:00','Parkview Manor, Toronto','Wedding ceremony and reception, 150 guests','confirmed',2500.00,'2025-02-26 11:30:00','2025-02-26 11:40:00'),(3,15,8,14,'2025-04-05','09:00:00','13:00:00','Studio Lumière, Paris','Portfolio update for modeling agency','confirmed',650.00,'2025-02-26 12:00:00','2025-02-26 12:15:00'),(4,16,10,18,'2025-03-28','08:00:00','14:00:00','Modern Office Tower, Tokyo','Architectural shots of new corporate headquarters','pending',750.00,'2025-02-26 12:30:00','2025-02-26 12:30:00'),(5,17,9,16,'2025-04-12','06:00:00','09:00:00','Coastal Path, Barcelona','Sunrise landscape photoshoot','confirmed',400.00,'2025-02-26 13:00:00','2025-02-26 13:10:00'),(6,18,6,11,'2025-03-10','10:00:00','11:00:00','Studio Portrait, London','Professional headshots for LinkedIn','completed',200.00,'2025-02-26 13:30:00','2025-02-26 14:30:00'),(7,19,7,13,'2025-05-18','18:00:00','23:00:00','Grand Hotel, Toronto','Corporate anniversary gala, 300 attendees','confirmed',800.00,'2025-02-26 14:00:00','2025-02-26 14:15:00'),(8,20,8,15,'2025-04-20','08:00:00','16:00:00','Le Bistro, Paris','Commercial shoot for restaurant menu and website','pending',1200.00,'2025-02-26 14:30:00','2025-02-26 14:30:00'),(9,13,9,17,'2025-05-05','07:00:00','19:00:00','Costa Brava, Spain','Travel magazine assignment','pending',900.00,'2025-02-26 15:00:00','2025-02-26 15:00:00'),(10,14,10,19,'2025-04-15','09:00:00','16:00:00','Luxury Apartment, Tokyo','Interior design photoshoot for real estate listing','confirmed',950.00,'2025-02-26 15:30:00','2025-02-26 15:45:00'),(11,7,5,9,'2025-03-01','13:25:00',NULL,'Limerick','Notesuhjkhjkjkhkhjkhjl','pending',2500.00,'2025-03-01 13:25:32','2025-03-01 13:25:32');
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Wedding','wedding','Wedding photography services','2025-02-24 18:34:03','2025-02-24 18:34:03'),(2,'Portrait','portrait','Portrait photography services','2025-02-24 18:34:03','2025-02-24 18:34:03'),(3,'Event','event','Event photography services','2025-02-24 18:34:03','2025-02-24 18:34:03'),(4,'Commercial','commercial','Commercial photography services','2025-02-24 18:34:03','2025-02-24 18:34:03'),(5,'Landscape','landscape','Landscape photography services','2025-02-24 18:34:03','2025-02-24 18:34:03'),(6,'Paranormal','paranormal','Only Rick CAN DO','2025-03-03 15:44:00','2025-03-03 15:44:00');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversation_participants`
--

DROP TABLE IF EXISTS `conversation_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversation_participants` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `last_read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `conversation_id` (`conversation_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `conversation_participants_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conversation_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_participants`
--

LOCK TABLES `conversation_participants` WRITE;
/*!40000 ALTER TABLE `conversation_participants` DISABLE KEYS */;
INSERT INTO `conversation_participants` VALUES (1,1,13,'2025-02-26 11:15:00','2025-02-26 10:30:00'),(2,1,8,'2025-02-26 11:10:00','2025-02-26 10:30:00'),(3,2,14,'2025-02-26 11:45:00','2025-02-26 11:20:00'),(4,2,9,'2025-02-26 11:40:00','2025-02-26 11:20:00'),(5,3,15,'2025-02-26 12:20:00','2025-02-26 11:50:00'),(6,3,10,'2025-02-26 12:15:00','2025-02-26 11:50:00'),(7,4,16,'2025-02-26 12:40:00','2025-02-26 12:25:00'),(8,4,12,'2025-02-26 12:35:00','2025-02-26 12:25:00'),(9,5,17,'2025-02-26 13:15:00','2025-02-26 12:45:00'),(10,5,11,'2025-02-26 13:10:00','2025-02-26 12:45:00'),(11,6,7,'2025-03-01 13:43:05','2025-03-01 13:43:05'),(12,6,5,NULL,'2025-03-01 13:43:05');
/*!40000 ALTER TABLE `conversation_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) DEFAULT NULL,
  `booking_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `conversations_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,'Family Portrait Inquiry',1,'2025-02-26 10:30:00','2025-02-26 11:15:00'),(2,'Wedding Photography Discussion',2,'2025-02-26 11:20:00','2025-02-26 11:45:00'),(3,'Fashion Portfolio Session',3,'2025-02-26 11:50:00','2025-02-26 12:20:00'),(4,'Architectural Photography Project',4,'2025-02-26 12:25:00','2025-02-26 12:40:00'),(5,'Landscape Photography Session',5,'2025-02-26 12:45:00','2025-02-26 13:15:00'),(6,'test',NULL,'2025-03-01 13:43:05','2025-03-01 13:43:05');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `customer_id` bigint unsigned NOT NULL,
  `photographer_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_id` (`customer_id`,`photographer_id`),
  KEY `photographer_id` (`photographer_id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`photographer_id`) REFERENCES `photographer_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint unsigned NOT NULL,
  `sender_id` bigint unsigned NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `conversation_id` (`conversation_id`),
  KEY `sender_id` (`sender_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,13,'Hi Emma, I\'m interested in booking a family portrait session for my family of 5. Do you have availability on March 15th?',1,'2025-02-26 10:30:00','2025-02-26 10:35:00'),(2,1,8,'Hello Maria! Yes, I have availability on March 15th. Would you prefer a studio session or outdoor location?',1,'2025-02-26 10:35:00','2025-02-26 10:40:00'),(3,1,13,'I think outdoors would be nice. Hyde Park perhaps?',1,'2025-02-26 10:40:00','2025-02-26 10:45:00'),(4,1,8,'Hyde Park would be perfect for a family shoot! I have 2pm-4pm available. Would that work for you?',1,'2025-02-26 10:45:00','2025-02-26 10:50:00'),(5,1,13,'That timing is perfect. We\'ll book it! Do you need any specific information about our family?',1,'2025-02-26 10:50:00','2025-02-26 10:55:00'),(6,1,8,'Great! It would be helpful to know the ages of your children and if you have any specific poses or styles in mind.',1,'2025-02-26 10:55:00','2025-02-26 11:00:00'),(7,1,13,'We have three children aged 2, 5, and 8. We\'d like natural, candid shots mainly, nothing too posed. Our 2-year-old can be a bit shy with strangers.',1,'2025-02-26 11:00:00','2025-02-26 11:05:00'),(8,1,8,'Thanks for letting me know! I\'m great with kids and will make sure everyone feels comfortable. I\'ll start with some group shots and then move to more playful candids to help your little one warm up.',1,'2025-02-26 11:05:00','2025-02-26 11:10:00'),(9,1,13,'That sounds perfect! Looking forward to it. Should I make the payment now?',1,'2025-02-26 11:10:00','2025-02-26 11:15:00'),(10,2,14,'Hello David, my fiancée and I are getting married on June 22nd and are looking for a wedding photographer. Are you available?',1,'2025-02-26 11:20:00','2025-02-26 11:25:00'),(11,6,7,'testmessage',0,'2025-03-01 13:43:05','2025-03-01 13:43:05');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000001_create_cache_table',1),(2,'0001_01_01_000002_create_jobs_table',1),(3,'2025_02_24_165119_create_personal_access_tokens_table',1),(4,'2025_03_02_003226_create_service_categories_table',2),(5,'2025_03_02_003523_migrate_service_categories',2),(6,'2025_03_02_005112_add_image_to_services_table',3);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',2,'auth_token','27570cedb1912bf4e8919d4daaae405f972693384a5dca5e8a8d43004762b2a5','[\"*\"]','2025-02-24 17:53:40',NULL,'2025-02-24 17:45:56','2025-02-24 17:53:40'),(2,'App\\Models\\User',1,'auth_token','986be732c477c1add670db361b91194d8816c9852f9dd1c3bbd8b96da74679b2','[\"*\"]','2025-02-24 18:27:06',NULL,'2025-02-24 17:53:54','2025-02-24 18:27:06'),(3,'App\\Models\\User',3,'auth_token','aaf90a06329ccf9b9f55b8f0f6c6a8ca2b8eb1350993bb2b0e6b4f77c134e6e7','[\"*\"]','2025-02-24 18:29:28',NULL,'2025-02-24 18:28:04','2025-02-24 18:29:28'),(7,'App\\Models\\User',3,'auth_token','dbcd84d8e45d244c0240b9bf56f5318cf7ad2447611992a64d50c7caa6dfcef3','[\"*\"]','2025-02-28 23:12:09',NULL,'2025-02-26 19:52:14','2025-02-28 23:12:09'),(8,'App\\Models\\User',3,'auth_token','1aba31cce873ae1ed195b6d6d47d18300c0d21ad652f99dde5c6fbfab85da561','[\"*\"]','2025-02-28 23:12:16',NULL,'2025-02-28 23:12:14','2025-02-28 23:12:16'),(9,'App\\Models\\User',3,'auth_token','691817bf2254bbfa51d997c180a492663a1e179f86727f392cfc7783ff541fa1','[\"*\"]','2025-02-28 23:13:05',NULL,'2025-02-28 23:13:03','2025-02-28 23:13:05'),(10,'App\\Models\\User',3,'auth_token','b4aa1f7cd4ff3db6f6ef75c447d7db97607024477afa0fc766d818663e4daf76','[\"*\"]','2025-02-28 23:20:01',NULL,'2025-02-28 23:19:59','2025-02-28 23:20:01'),(11,'App\\Models\\User',3,'auth_token','749d9e5b7045868727fc09063398a47edecd6765da41b15e01b1cdf2f6dc68f1','[\"*\"]','2025-02-28 23:23:42',NULL,'2025-02-28 23:23:39','2025-02-28 23:23:42'),(12,'App\\Models\\User',3,'auth_token','f665e6be22861e7b26faf927346339fbbeeae4213ea590fd9d7c06d735917377','[\"*\"]','2025-02-28 23:24:14',NULL,'2025-02-28 23:24:12','2025-02-28 23:24:14'),(13,'App\\Models\\User',3,'auth_token','038eaf7530cb96b8f88a6607b9f60c5ef345560f11f80b4f40124748ed818e21','[\"*\"]','2025-02-28 23:24:18',NULL,'2025-02-28 23:24:16','2025-02-28 23:24:18'),(14,'App\\Models\\User',3,'auth_token','36c9d673d52425a77ee8666736341e3d1877142bb990ae8a3a939f38522f2ffa','[\"*\"]','2025-02-28 23:24:39',NULL,'2025-02-28 23:24:37','2025-02-28 23:24:39'),(15,'App\\Models\\User',7,'auth_token','5086bed8297df74c7f93ed2ef73a2ed3c44300bf731ecf1e2335f611b9df4486','[\"*\"]','2025-02-28 23:25:32',NULL,'2025-02-28 23:25:31','2025-02-28 23:25:32'),(16,'App\\Models\\User',7,'auth_token','2e14ea37fd88f6915561f370e91ea34c9db941c712f428ffaf1899099c45cdc8','[\"*\"]','2025-02-28 23:25:38',NULL,'2025-02-28 23:25:36','2025-02-28 23:25:38'),(17,'App\\Models\\User',7,'auth_token','fa42f10efe40314e18d26d8602d1f4089da8dc198efcb48758e01f97f009cd99','[\"*\"]','2025-02-28 23:33:23',NULL,'2025-02-28 23:33:21','2025-02-28 23:33:23'),(18,'App\\Models\\User',3,'auth_token','d6f6b2fad77bf63fe5bdcf4f2a0cb83ad3fc3867066b8d1af850d1178455f2b1','[\"*\"]','2025-02-28 23:33:29',NULL,'2025-02-28 23:33:28','2025-02-28 23:33:29'),(19,'App\\Models\\User',3,'auth_token','1e237a4b0aaf5775e73d2acad3cb15dae428ff9c83b1bb1cc46a7ca2109e09d3','[\"*\"]','2025-02-28 23:35:57',NULL,'2025-02-28 23:35:56','2025-02-28 23:35:57'),(20,'App\\Models\\User',3,'auth_token','658d6439a7e0a05fe12eca651a493104f978362fe21eec8f4dc119e613af8000','[\"*\"]','2025-02-28 23:39:08',NULL,'2025-02-28 23:39:07','2025-02-28 23:39:08'),(21,'App\\Models\\User',3,'auth_token','fae44e44720d90e6d53ea2a06c12ba5cacb082ecda5f790b4ecbfe6da0dd36d5','[\"*\"]','2025-02-28 23:48:00',NULL,'2025-02-28 23:43:20','2025-02-28 23:48:00'),(22,'App\\Models\\User',3,'auth_token','859ce42bbad2dfd6abc5b0b0ea5d49e9fe7077e9ec1a94b35150926621dd2ddd','[\"*\"]','2025-02-28 23:49:59',NULL,'2025-02-28 23:49:55','2025-02-28 23:49:59'),(23,'App\\Models\\User',3,'auth_token','a35720a599f8bb1dd68ffb827f60c8aba2730c5d414dd1a22715b7127f8ad6b9','[\"*\"]','2025-02-28 23:50:12',NULL,'2025-02-28 23:50:10','2025-02-28 23:50:12'),(24,'App\\Models\\User',3,'auth_token','0be322c0dc643046049445f5eeac4d72335e97221e539550779724fb299e2412','[\"*\"]','2025-02-28 23:50:34',NULL,'2025-02-28 23:50:32','2025-02-28 23:50:34'),(25,'App\\Models\\User',3,'auth_token','d744eab17458571297656485f929692e9cd2d9509c454e6f9a85ffad7a9186aa','[\"*\"]','2025-02-28 23:50:59',NULL,'2025-02-28 23:50:58','2025-02-28 23:50:59'),(26,'App\\Models\\User',7,'auth_token','4fc3a06060e7549d4785538cf29f2776f20c9dff7455b80beb50408dbffaa63e','[\"*\"]','2025-02-28 23:51:41',NULL,'2025-02-28 23:51:40','2025-02-28 23:51:41'),(27,'App\\Models\\User',7,'auth_token','4206060b351a68e1679621b292937d9b7a681c2e0f15a8eccc8efddc2b27d22b','[\"*\"]','2025-02-28 23:52:31',NULL,'2025-02-28 23:52:28','2025-02-28 23:52:31'),(28,'App\\Models\\User',7,'auth_token','58ddf225f62ecb79558085d8724e0e6c7ccd9677b2eccd346b676b793de59413','[\"*\"]','2025-02-28 23:54:39',NULL,'2025-02-28 23:54:37','2025-02-28 23:54:39'),(29,'App\\Models\\User',7,'auth_token','34a4f12eebbaa800c389f9a0439ba611c3d5d0eae83ec809ea0527de36faefbd','[\"*\"]','2025-02-28 23:54:54',NULL,'2025-02-28 23:54:54','2025-02-28 23:54:54'),(30,'App\\Models\\User',3,'auth_token','eb05dce8370ac8f153aa48988a91310c638fbb3e6acdcba8f3935870dfdd4617','[\"*\"]','2025-02-28 23:54:59',NULL,'2025-02-28 23:54:58','2025-02-28 23:54:59'),(31,'App\\Models\\User',3,'auth_token','a334202b74aed985131c1396d62c3be2d828b646c962ca656365836186c86e98','[\"*\"]','2025-02-28 23:55:08',NULL,'2025-02-28 23:55:07','2025-02-28 23:55:08'),(32,'App\\Models\\User',3,'auth_token','c5989934e627493db9ad960fd5d112bdb85d22a2eb7e46d72f8ee43b560c6026','[\"*\"]','2025-02-28 23:56:24',NULL,'2025-02-28 23:56:23','2025-02-28 23:56:24'),(33,'App\\Models\\User',3,'auth_token','51efdd9f733f8d9ee80a97560481a11435bcfb3a75909cfd803ae70be812af6d','[\"*\"]','2025-02-28 23:59:44',NULL,'2025-02-28 23:59:43','2025-02-28 23:59:44'),(34,'App\\Models\\User',3,'auth_token','49ead2bdf88e4e1e7774b099a4fd6375e6319037fde22f884bf48c2072ebe76d','[\"*\"]','2025-03-01 00:02:14',NULL,'2025-03-01 00:02:13','2025-03-01 00:02:14'),(35,'App\\Models\\User',3,'auth_token','4656a0e5eaf1bb03751c17502940d1be7605c587f115c80a6bd37ee9bcb3433b','[\"*\"]','2025-03-01 10:11:22',NULL,'2025-03-01 00:14:11','2025-03-01 10:11:22'),(36,'App\\Models\\User',7,'auth_token','4097234d40b712235d869cf37c67398f23cdccac5d294bcb2bcb0ffc78e0fbc1','[\"*\"]','2025-03-01 13:44:07',NULL,'2025-03-01 10:17:32','2025-03-01 13:44:07'),(39,'App\\Models\\User',3,'auth_token','af9d70fcc643c1ff0aa281b3226675ac9ee11ca43ef6ceb36b71fba752a5e4fe','[\"*\"]','2025-03-03 15:24:41',NULL,'2025-03-02 17:54:33','2025-03-03 15:24:41'),(40,'App\\Models\\User',7,'auth_token','59bffa6c4113bb7b4608abdf6146cfc3100f47f8b9e940971133c6144b9dfb4b','[\"*\"]','2025-03-03 15:24:48',NULL,'2025-03-03 15:24:47','2025-03-03 15:24:48');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photographer_categories`
--

DROP TABLE IF EXISTS `photographer_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `photographer_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `photographer_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `photographer_id` (`photographer_id`,`category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `photographer_categories_ibfk_1` FOREIGN KEY (`photographer_id`) REFERENCES `photographer_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `photographer_categories_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photographer_categories`
--

LOCK TABLES `photographer_categories` WRITE;
/*!40000 ALTER TABLE `photographer_categories` DISABLE KEYS */;
INSERT INTO `photographer_categories` VALUES (1,1,1,'2025-02-24 18:34:03'),(3,2,1,'2025-02-24 18:34:03'),(4,3,2,'2025-02-24 18:34:03'),(5,3,4,'2025-02-24 18:34:03'),(6,4,5,'2025-02-24 18:34:03'),(7,5,6,'2025-02-24 18:34:03'),(8,5,3,'2025-02-24 18:34:03'),(9,6,2,'2025-02-26 10:00:00'),(10,6,4,'2025-02-26 10:00:00'),(11,7,1,'2025-02-26 10:01:00'),(12,7,3,'2025-02-26 10:01:00'),(13,8,2,'2025-02-26 10:02:00'),(14,8,4,'2025-02-26 10:02:00'),(15,9,5,'2025-02-26 10:03:00'),(16,10,4,'2025-02-26 10:04:00'),(17,10,5,'2025-02-26 10:04:00');
/*!40000 ALTER TABLE `photographer_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photographer_profiles`
--

DROP TABLE IF EXISTS `photographer_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `photographer_profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `experience_years` int unsigned DEFAULT '0',
  `photoshoot_count` int unsigned DEFAULT '0',
  `location` varchar(255) DEFAULT NULL,
  `starting_price` decimal(10,2) DEFAULT NULL,
  `banner_image` varchar(255) DEFAULT NULL,
  `featured` tinyint(1) DEFAULT '0',
  `verified` tinyint(1) DEFAULT '0',
  `average_rating` decimal(3,2) DEFAULT NULL,
  `review_count` int unsigned DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `photographer_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photographer_profiles`
--

LOCK TABLES `photographer_profiles` WRITE;
/*!40000 ALTER TABLE `photographer_profiles` DISABLE KEYS */;
INSERT INTO `photographer_profiles` VALUES (1,1,'Wedding',5,150,'New York, USA',1000.00,'https://x.dkphoto.ie/wp-content/uploads/2019/12/Wedding-Photographer-Louth.jpg',1,1,4.85,48,'2025-02-24 18:34:03','2025-03-03 17:28:25'),(2,2,'Wedding',7,220,'Los Angeles, USA',150.00,'https://www.chrisboland.com/wp-content/uploads/2024/01/styles-1.jpg',1,1,4.90,63,'2025-02-24 18:34:03','2025-02-27 20:39:10'),(3,3,'Portrait & Fashion',3,85,'Chicago, USA',90.00,'https://www.wherewonderwaits.com/wp-content/uploads/2022/07/8d80f6674f4d406b879dba4ce2b90150-2.jpg',0,1,4.50,32,'2025-02-24 18:34:03','2025-02-27 20:39:10'),(4,4,'Landscape & Nature',8,120,'Seattle, USA',120.00,'https://images.ireland.com/media/Images/amazing-landscapes/5079b776bd3645da95169ccd51f4278d.jpg',0,1,4.80,41,'2025-02-24 18:34:03','2025-02-27 20:39:10'),(5,5,'Paranormal Portfolio Photography',6,175,'Miami, USA',200.00,'https://media.gq.com/photos/6577b95756b753fcf473be4b/4:3/w_1440,h_1080,c_limit/AS_RAM_709_RickfendingYourMort-10.png',1,1,5.00,37,'2025-02-24 18:34:03','2025-03-03 16:09:54'),(6,8,'Portrait & Family',10,240,'London, UK',120.00,'https://www.barrettandcoe.co.uk/bcwp/wp-content/uploads/2016/04/barrett-coe-family-photograpy-084.jpg',1,1,4.80,52,'2025-02-26 10:00:00','2025-02-27 20:39:10'),(7,9,'Architecture & Minimalist',8,180,'Toronto, Canada',180.00,'https://d1hjkbq40fs2x4.cloudfront.net/2016-11-10/files/Canon-snapshot-minimalist-photography-3.jpg',0,1,4.85,39,'2025-02-26 10:01:00','2025-02-27 20:39:10'),(8,10,'Fashion & Editorial',6,95,'Paris, France',220.00,'https://academy-cdn.wedio.com/2021/10/editorial-photography-fun-1.jpg',1,1,4.75,28,'2025-02-26 10:02:00','2025-02-27 20:39:10'),(9,11,'Travel & Landscape',12,310,'Barcelona, Spain',150.00,'https://www.diyphotography.net/wp-content/uploads/2019/01/Aquamarine.jpg',0,1,4.90,47,'2025-02-26 10:03:00','2025-02-27 20:39:10'),(10,12,'Landscape & Commercial',9,125,'Tokyo, Japan',190.00,'https://www.tokyoweekender.com/wp-content/uploads/2018/07/Differentkind_1500px.jpg',1,1,4.95,36,'2025-02-26 10:04:00','2025-03-03 17:55:10');
/*!40000 ALTER TABLE `photographer_profiles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `portfolio_items`
--

DROP TABLE IF EXISTS `portfolio_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `portfolio_items` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `photographer_id` bigint unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `image_path` varchar(255) NOT NULL,
  `category_id` bigint unsigned DEFAULT NULL,
  `featured` tinyint(1) DEFAULT '0',
  `sort_order` int unsigned DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `photographer_id` (`photographer_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `portfolio_items_ibfk_1` FOREIGN KEY (`photographer_id`) REFERENCES `photographer_profiles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `portfolio_items_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `portfolio_items`
--

LOCK TABLES `portfolio_items` WRITE;
/*!40000 ALTER TABLE `portfolio_items` DISABLE KEYS */;
INSERT INTO `portfolio_items` VALUES (1,1,'Summer Wedding','Beautiful summer wedding in Central Park','https://images.squarespace-cdn.com/content/v1/52c01bc6e4b0816e9a8d12d6/2eb512a7-aacd-4007-b0c1-9c541531eb82/080__chicheley-hall-wedding-photography.jpg',1,1,1,'2025-02-24 18:34:03','2025-02-27 20:49:55'),(2,1,'Fantasy Wedding','Gorgeous lights and happy couple','https://images.squarespace-cdn.com/content/v1/5a78b94a90bade124da7b30d/1635153472269-PCCG6DESQ7NKLT6UEE3H/247933523_260841486053247_8557544500249407555_n.jpg',1,1,2,'2025-02-24 18:34:03','2025-03-03 17:24:41'),(3,2,'Sunrise','Yes, that\'s you in the photo.','https://www.theblondeabroad.com/wp-content/uploads/2016/11/africa-cape-town-photography.jpg',5,1,1,'2025-02-24 18:34:03','2025-03-03 18:11:00'),(4,2,'Successful ig accounts','It works - at least I think so!','https://www.hopperhq.com/wp-content/uploads/2017/02/justgoshoot.png',2,0,2,'2025-02-24 18:34:03','2025-03-03 18:11:00'),(5,3,'Studio Portrait','Professional studio portrait session','https://images.squarespace-cdn.com/content/v1/5f1951d06780aa7b603280fa/1620765900431-6DTXMPJKR3UCFII7N3BT/Young+man+looking+straight+at+the+camera+with+a+white+studio+background%2C+smiling.',2,1,1,'2025-02-24 18:34:03','2025-02-27 20:49:55'),(6,3,'Fashion Editorial','High-end fashion editorial shoot','https://www.sleek-mag.com/wp-content/uploads/2017/04/sleek_53_womens_fashion_Mark_Rabadan_Toby_Grimditch13.jpg',4,0,2,'2025-02-24 18:34:03','2025-02-27 20:49:55'),(7,4,'Mountain Vista','Breathtaking mountain landscape','https://gray-ktvf-prod.gtv-cdn.com/resizer/v2/3LDM7YHEVFJZRJPESGYNPWOUZI.jpg',5,1,1,'2025-02-24 18:34:03','2025-02-27 20:49:55'),(8,4,'Coastal Sunset','Dramatic coastal sunset photography','https://www.garethmccormack.com/wp-content/uploads/2020/06/ICE895-1.jpg',5,0,2,'2025-02-24 18:34:03','2025-02-27 20:49:55'),(9,5,'Morty with King Jellybean','They all have round heads!','https://static1.srcdn.com/wordpress/wp-content/uploads/2020/12/Rick-and-morty-King-Jellybean.jpg',6,1,1,'2025-02-24 18:34:03','2025-03-03 15:47:02'),(10,5,'Very happy Morty','The ufo is new, but it\'s not mine.','https://wallpapersok.com/images/hd/rick-and-morty-inside-a-ufo-sad-ae71o9pdo8rtii95.jpg',6,0,2,'2025-02-24 18:34:03','2025-03-03 15:47:02'),(11,6,'Family Portrait Session','Outdoor family portraits in autumn colors','https://images.squarespace-cdn.com/content/v1/5b15bd7889c1720c3a901616/1676586896134-PUIK7I3V0S96UUAVDON5/IMG_9621.jpg',2,1,1,'2025-02-26 10:00:00','2025-02-27 20:49:55'),(12,6,'Corporate Headshots','Professional headshots for a finance team','https://frameshot.co.uk/wp-content/uploads/Corporate-Headshot-on-black-background-002_00254.jpg',4,0,2,'2025-02-26 10:00:01','2025-02-27 20:49:55'),(13,7,'Spring Garden Wedding','Elegant outdoor wedding ceremony and reception','https://images.squarespace-cdn.com/content/v1/5824c6435016e1578012dcdf/b33a6157-e268-47a3-bfff-5fbb0f357dea/Picture1.jpg',1,1,1,'2025-02-26 10:01:00','2025-02-27 20:49:55'),(14,7,'Corporate Anniversary','Large-scale corporate event with 500+ attendees','https://www.aiglobalmedialtd.com/wp-content/uploads/2023/03/Corporate-Anniversary-Marketing-How-Can-Businesses-Celebrate-Their-Milestones.jpg',3,0,2,'2025-02-26 10:01:01','2025-02-27 20:49:55'),(15,8,'Vogue Editorial','High fashion editorial for major magazine','https://assets.vogue.com/photos/5e975989468f4b000812b630/master/w_1600%2Cc_limit/VO0520_Archive_01.jpg',2,1,1,'2025-02-26 10:02:00','2025-02-27 20:49:55'),(16,8,'Designer Lookbook','Spring collection lookbook for fashion designer','https://images.squarespace-cdn.com/content/v1/56e01a657da24fcf36df5816/1483823504672-U71OOUT9VD9FKSWFINP5/High-end-lookbook-photographer-London.jpg',4,0,2,'2025-02-26 10:02:01','2025-02-27 20:49:55'),(17,9,'Scottish Highlands','Dramatic landscape series from Scotland','https://i0.wp.com/ugoceiphotography.com/wp-content/uploads/2015/10/20150921-XE2S3192-HDR.jpg',5,1,1,'2025-02-26 10:03:00','2025-02-27 20:49:55'),(18,9,'Moroccan Journey','Travel documentary series from Morocco','https://www.darioendara.com/wp-content/uploads/2020/04/01-ait-ben-haddou-morocco-travel-photography.jpg',5,0,2,'2025-02-26 10:03:01','2025-02-27 20:49:55'),(19,10,'Tokyo Perspectives','Minimalist architectural studies of Tokyo','https://www.datocms-assets.com/101439/1700293204-tokyo-night-view.webp',5,1,1,'2025-02-26 10:04:00','2025-02-27 20:49:55'),(20,10,'Modern Interiors','Clean, minimalist interior design photography','https://www.windermere.com/files/2022/06/Blog-Featured-Image-1240-x-480-contemporary.png',4,0,2,'2025-02-26 10:04:01','2025-02-27 20:49:55');
/*!40000 ALTER TABLE `portfolio_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint unsigned DEFAULT NULL,
  `customer_id` bigint unsigned NOT NULL,
  `photographer_id` bigint unsigned NOT NULL,
  `rating` decimal(3,2) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `review` text,
  `service_type` varchar(100) DEFAULT NULL,
  `service_date` date DEFAULT NULL,
  `reply` text,
  `reply_date` timestamp NULL DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `booking_id` (`booking_id`),
  KEY `customer_id` (`customer_id`),
  KEY `photographer_id` (`photographer_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`photographer_id`) REFERENCES `photographer_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,NULL,6,1,4.50,'Great wedding photos','John did an amazing job capturing our special day. The photos were delivered on time and exceeded our expectations.','Wedding Photography','2024-01-15','Thank you for your kind words!','2024-01-20 14:30:00',1,'2025-02-24 18:34:51','2025-02-24 18:34:51'),(3,NULL,6,3,4.00,'Good portrait session','Mike is talented and has a good eye for composition. Would use his services again.','Portrait Photography','2024-01-25','Thanks for the feedback!','2024-01-26 10:15:00',1,'2025-02-24 18:34:51','2025-02-24 18:34:51'),(4,6,18,6,4.80,'Professional and efficient service','Emma was very professional and made me feel comfortable during the headshot session. The photos turned out great for my LinkedIn profile.','Professional Headshots','2025-03-10','Thank you for your kind words! It was a pleasure working with you.','2025-03-12 09:30:00',1,'2025-03-11 14:00:00','2025-03-12 09:30:00'),(5,NULL,13,7,4.90,'Amazing wedding photographer','David captured our engagement photos and we were so impressed we booked him for our wedding. Highly recommended!','Engagement Session','2025-01-20','I appreciate your review and am looking forward to photographing your wedding!','2025-02-27 11:20:00',1,'2025-02-27 10:15:00','2025-02-27 11:20:00'),(6,NULL,15,8,4.70,'Great fashion portfolio session','Sophie has an amazing eye for fashion photography. My agency was very impressed with the portfolio shots.','Fashion Portfolio','2025-02-05',NULL,NULL,1,'2025-02-10 16:30:00','2025-02-10 16:30:00'),(7,NULL,17,9,5.00,'Breathtaking landscape photos','Carlos has an exceptional talent for capturing landscapes. The sunrise photos exceeded all my expectations.','Landscape Photography','2025-02-12','Thank you for the kind review! The lighting that morning was perfect.','2025-02-15 08:45:00',1,'2025-02-14 19:20:00','2025-02-15 08:45:00'),(8,NULL,16,10,4.90,'Stunning architectural photography','Akira has a unique perspective on architectural photography. The minimalist approach perfectly captured our building design.','Architectural Photography','2025-02-18','I appreciate your feedback and enjoyed working on your project!','2025-02-20 14:10:00',1,'2025-02-19 11:45:00','2025-02-20 14:10:00'),(9,NULL,7,5,5.00,'Very good photo!','Test by Xunze','Commercial','2025-03-01',NULL,NULL,1,'2025-03-01 13:43:58','2025-03-01 13:43:58');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_categories`
--

DROP TABLE IF EXISTS `service_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_categories` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `service_id` bigint unsigned NOT NULL,
  `category_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `service_categories_service_id_category_id_unique` (`service_id`,`category_id`),
  KEY `service_categories_category_id_foreign` (`category_id`),
  CONSTRAINT `service_categories_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `service_categories_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_categories`
--

LOCK TABLES `service_categories` WRITE;
/*!40000 ALTER TABLE `service_categories` DISABLE KEYS */;
INSERT INTO `service_categories` VALUES (1,1,1,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(2,2,1,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(3,3,5,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(4,4,2,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(5,5,2,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(6,6,2,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(7,7,5,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(10,10,2,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(11,11,2,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(12,12,1,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(13,13,1,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(14,14,2,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(15,15,2,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(16,16,5,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(17,17,5,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(18,18,4,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(19,19,5,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(20,8,6,NULL,NULL),(21,9,6,NULL,NULL);
/*!40000 ALTER TABLE `service_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `service_features`
--

DROP TABLE IF EXISTS `service_features`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service_features` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `service_id` bigint unsigned NOT NULL,
  `feature` varchar(255) NOT NULL,
  `sort_order` int unsigned DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `service_id` (`service_id`),
  CONSTRAINT `service_features_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_features`
--

LOCK TABLES `service_features` WRITE;
/*!40000 ALTER TABLE `service_features` DISABLE KEYS */;
INSERT INTO `service_features` VALUES (1,1,'4 hours coverage',1,'2025-02-24 18:34:03'),(2,1,'100 edited digital photos',2,'2025-02-24 18:34:03'),(3,1,'Online gallery delivery',3,'2025-02-24 18:34:03'),(4,2,'8 hours coverage',1,'2025-02-24 18:34:03'),(5,2,'300 edited digital photos',2,'2025-02-24 18:34:03'),(6,2,'Second photographer',3,'2025-02-24 18:34:03'),(7,2,'Premium photo album',4,'2025-02-24 18:34:03'),(8,3,'Multiple Account Support',1,'2025-02-24 18:34:03'),(9,3,'Customisable with all content',2,'2025-02-24 18:34:03'),(10,4,'Choose whatever you want to wear',1,'2025-02-24 18:34:03'),(11,4,'Unlimited photos',2,'2025-02-24 18:34:03'),(12,4,'Premium photo album',3,'2025-02-24 18:34:03'),(13,4,'Engagement session included',4,'2025-02-24 18:34:03'),(14,5,'20 edited photos',1,'2025-02-24 18:34:03'),(15,5,'Professional retouching',2,'2025-02-24 18:34:03'),(16,10,'2-hour session at your chosen location',1,'2025-02-26 10:00:00'),(17,10,'20 professionally edited digital photos',2,'2025-02-26 10:00:00'),(18,10,'Online gallery for sharing',3,'2025-02-26 10:00:00'),(19,10,'Print packages available',4,'2025-02-26 10:00:00'),(20,11,'1-hour studio session',1,'2025-02-26 10:00:01'),(21,11,'5 professionally edited digital headshots',2,'2025-02-26 10:00:01'),(22,11,'Quick turnaround (48 hours)',3,'2025-02-26 10:00:01'),(23,12,'12 hours of wedding day coverage',1,'2025-02-26 10:01:00'),(24,12,'Second photographer included',2,'2025-02-26 10:01:00'),(25,12,'500+ edited digital photos',3,'2025-02-26 10:01:00'),(26,12,'Premium wedding album',4,'2025-02-26 10:01:00'),(27,12,'Engagement session included',5,'2025-02-26 10:01:00'),(28,13,'5 hours of event coverage',1,'2025-02-26 10:01:01'),(29,13,'200+ edited digital photos',2,'2025-02-26 10:01:01'),(30,13,'48-hour preview delivery',3,'2025-02-26 10:01:01');
/*!40000 ALTER TABLE `service_features` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `photographer_id` bigint unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `duration` int DEFAULT NULL COMMENT 'Duration in minutes',
  `unit` varchar(50) DEFAULT 'hour' COMMENT 'hour, session, day, etc.',
  `is_featured` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `photographer_id` (`photographer_id`),
  CONSTRAINT `services_ibfk_1` FOREIGN KEY (`photographer_id`) REFERENCES `photographer_profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,1,'Basic Wedding Package','Coverage of ceremony and reception',1000.00,240,'package',0,1,'https://thefennells.ie/source/wp-content/uploads/2020/11/Wedding-Photography-5852-1024x684.jpg','2025-02-24 18:34:03','2025-03-02 14:38:09'),(2,1,'Premium Wedding Package','Full day coverage including preparations',2000.00,480,'package',1,1,'https://connectart.io/wp-content/uploads/2024/08/Rafaella-1.webp','2025-02-24 18:34:03','2025-03-02 14:38:09'),(3,2,'Basic Instagram glow-up package','Give you fantastic life record',500.00,360,'package',0,1,'https://www.wedgewoodweddings.com/hubfs/3.0%20Feature%20Images%201000%20x%20500%20px/Blog/Wedding-Album-Trends.png','2025-02-24 18:34:03','2025-03-03 18:03:13'),(4,2,'\"Vacation Without Traveling\"','Sitting at home, shooting outside',1500.00,720,'package',1,1,'https://www.honeytribephoto.com/wp-content/uploads/2022/01/honey-tribe-photo-wedding-album-0066-large.jpg','2025-02-24 18:34:03','2025-03-03 18:04:59'),(5,3,'Portrait Session','Standard portrait photography session',150.00,60,'hour',1,1,'https://images.squarespace-cdn.com/content/v1/5b15bd7889c1720c3a901616/1676586896134-PUIK7I3V0S96UUAVDON5/IMG_9621.jpg','2025-02-24 18:34:03','2025-03-02 14:38:09'),(6,3,'Fashion Portfolio','Professional fashion portfolio shoot',500.00,180,'session',0,1,'https://theloftstudio.ae/assets/images/resources/15/spring-127-result.jpg','2025-02-24 18:34:03','2025-03-02 14:38:09'),(7,4,'Landscape Print Session','Landscape photography with prints included',300.00,120,'session',1,1,'https://lauradouglasphoto.co.uk/wp-content/uploads/2021/05/Laura_Douglas_Surrey_Family_Photography-57-1.jpg','2025-02-24 18:34:03','2025-03-02 14:38:09'),(8,5,'UFO Pilot Moments','Show your handsome look in my spaceship!',100.00,60,'hour',0,1,'https://pixc.com/wp-content/uploads/2019/07/DIY-product-photography-hacks-featured.jpg','2025-02-24 18:34:03','2025-03-03 15:38:32'),(9,5,'Photo with extraterrestrial life','Take a photo with any creature you want, from Gromflomites to Mr. Poopybutthole!',2500.00,480,'project',1,1,'https://weedit.photos/wp-content/uploads/2022/05/famous-advertising-photographers-cover.jpg','2025-02-24 18:34:03','2025-03-03 15:39:03'),(10,6,'Family Portrait Package','',350.00,120,'session',1,1,'https://images.squarespace-cdn.com/content/v1/5aa1d0d74eddec4032868b2c/1563321550343-ICTY6SN2FHNL1DG2WEE3/Southlake+Family+Photographer','2025-02-26 10:00:00','2025-03-03 15:37:29'),(11,6,'Professional Headshots','Corporate and professional headshots with multiple outfit changes',200.00,60,'session',0,1,'https://images.squarespace-cdn.com/content/v1/5e2f9e7539df801c9548a5a1/1591931835413-UXMIM4RN4R9FXB2YO3UE/Dallas+Headshot+Photographer%2C+Jason+Kindig','2025-02-26 10:00:01','2025-03-02 14:38:09'),(12,7,'Complete Wedding Package','Full day wedding coverage from preparations to reception',2500.00,720,'package',1,1,'https://www.stewalkerphotography.com/wp-content/uploads/2022/01/Winter-Wedding-Adare-Manor57.jpg','2025-02-26 10:01:00','2025-03-02 14:38:09'),(13,7,'Event Photography','Corporate event or party coverage with professional editing',800.00,300,'event',0,1,'https://www.photo8.co.uk/wp-content/uploads/2020/01/Birmingham-event-photographer.jpg','2025-02-26 10:01:01','2025-03-02 14:38:09'),(14,8,'Fashion Portfolio','Professional fashion portfolio shoot for models',650.00,240,'session',1,1,'https://i.etsystatic.com/20116942/r/il/33efb7/5218437201/il_1080xN.5218437201_i3rm.jpg','2025-02-26 10:02:00','2025-03-02 14:38:09'),(15,8,'Commercial Fashion','Commercial fashion shoot for brands and designers',1200.00,480,'day',0,1,'https://images.squarespace-cdn.com/content/v1/56e01a657da24fcf36df5816/1483823504672-U71OOUT9VD9FKSWFINP5/High-end-lookbook-photographer-London.jpg','2025-02-26 10:02:01','2025-03-02 14:38:09'),(16,9,'Landscape Fine Art','Landscape photography with fine art prints included',400.00,180,'session',1,1,'https://cdn.fstoppers.com/styles/large-16-9/s3/lead/2017/11/isabella_tabacchi_-_landscape_photography_-_lenticular-shades.jpg','2025-02-26 10:03:00','2025-03-02 14:38:09'),(17,9,'Travel Documentary','Travel documentary photography for publications',900.00,480,'day',0,1,'https://www.productionparadise.com/newsletters/1841/photos/stefan-Nimmesgern-Munich-Madeira-travel-documentary-photography-social.jpg','2025-02-26 10:03:01','2025-03-02 14:38:09'),(18,10,'Architectural Portfolio','Architectural photography for portfolios and publications',750.00,360,'project',1,1,'https://media.apalmanac.com/wp-content/uploads/2021/01/04_Postcard_Portfolio_Apalmanac-1536x864.jpg','2025-02-26 10:04:00','2025-03-02 14:38:09'),(19,10,'Interior Design Package','Complete interior design photography for properties',950.00,420,'project',0,1,'https://www.decorilla.com/online-decorating/wp-content/uploads/2023/12/Modern-interior-design-ideas-for-a-living-room-by-Decorilla-1024x574.jpeg','2025-02-26 10:04:01','2025-03-02 00:54:09');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_details`
--

DROP TABLE IF EXISTS `user_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_details` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_details_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_details`
--

LOCK TABLES `user_details` WRITE;
/*!40000 ALTER TABLE `user_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('customer','photographer','admin') NOT NULL DEFAULT 'customer',
  `phone` varchar(20) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `bio` text,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `purchase_status` enum('none','active','expired') DEFAULT 'none',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'John Doe','john@example.com',NULL,'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','photographer','+1234567890','https://cfr2.mionet.top/mionet-a/2025/02/25/67bcd5bb96347.webp','This is an important life moment that you must capture on it.',NULL,'2025-02-24 18:34:03','2025-03-03 16:16:20','none'),(2,'Jane Smith','jane@example.com',NULL,'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','photographer','+1987654321','https://cfr2.mionet.top/mionet-a/2025/02/25/67bcd8a1ed4c4.jpg','You don\'t have to have actually been there.',NULL,'2025-02-24 18:34:03','2025-03-03 17:58:09','none'),(3,'Donald Trump','trump@example.com',NULL,'$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','photographer','+1122334455','https://cfr2.mionet.top/mionet-a/2025/02/25/67bcd918c7a1a.webp','Portrait and fashion photographer based in New York',NULL,'2025-02-24 18:34:03','2025-02-25 02:25:27','none'),(4,'Brian Griffin','brian@example.com',NULL,'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','photographer','+1555666777','https://cfr2.mionet.top/mionet-a/2025/02/25/67bcd98e7f517.png','Landscape and nature photography is my passion',NULL,'2025-02-24 18:34:03','2025-02-24 20:46:56','none'),(5,'Rick','morty@example.com',NULL,'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','photographer','+1888999000','https://hips.hearstapps.com/hmg-prod/images/rick-and-morty-season-six-image-1662104016.jpg?crop=0.411xw:0.730xh;0.450xw,0.0222xh&resize=980:*','Sometimes science is more art than science.',NULL,'2025-02-24 18:34:03','2025-03-03 15:30:46','none'),(6,'Félix Lengyel','felix@example.com',NULL,'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','customer','+1949084433','https://cfr2.mionet.top/mionet-a/2025/02/25/67bcda8f35d32.jpg','F**K',NULL,'2025-02-24 18:34:03','2025-02-24 20:46:56','none'),(7,'Xunze Tan','24247472@studentmail.ul.ie',NULL,'$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+3530438231873','https://cfr2.mionet.top/mionet-a/2024/12/17/67617d349d385.png',NULL,NULL,'2025-02-24 20:53:34','2025-02-27 20:31:47','none'),(8,'Emma Wilson','emma@example.com','2025-02-26 10:00:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','photographer','+4476543210','https://miro.medium.com/v2/resize:fit:1200/1*8NheDriDX-Wj1_4dqFcd3g.jpeg','Award-winning portrait photographer with 10 years experience',NULL,'2025-02-26 10:00:00','2025-02-27 20:31:47','none'),(9,'David Chen','david@example.com','2025-02-26 10:01:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','photographer','+4412345678','https://koreacrate.com/cdn/shop/articles/Exo_Chen_Marriage.jpg','Wedding and event photographer specializing in candid moments',NULL,'2025-02-26 10:01:00','2025-03-03 18:13:37','none'),(10,'Sophie Martin','sophie@example.com','2025-02-26 10:02:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','photographer','+3366778899','https://i0.wp.com/momentumleaders.org/wp-content/uploads/2023/09/Martin-Sophie-scaled-1.jpg','Fashion and editorial photographer based in Paris',NULL,'2025-02-26 10:02:00','2025-02-27 20:31:47','none'),(11,'Carlos Rodriguez','carlos@example.com','2025-02-26 10:03:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','photographer','+3412345678','https://wp-constellation-2021.s3.eu-west-2.amazonaws.com/media/2022/09/220902-Carlos-1.jpg','Travel and landscape photographer, always on the move',NULL,'2025-02-26 10:03:00','2025-02-27 20:31:47','none'),(12,'Akira Tanaka','akira@example.com','2025-02-26 10:04:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','photographer','+8112345678','https://www.morihamada.com/sites/default/files/people/images/aki-tanaka_thumb.jpg','Minimalist photographer specialising in the beauty of architecture',NULL,'2025-02-26 10:04:00','2025-03-03 17:55:51','none'),(13,'Maria Silva','maria@example.com','2025-02-26 10:05:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+5512345678','https://images.squarespace-cdn.com/content/v1/6089fc3366bb623a08f3e27a/37e15ed1-9681-4468-9dd0-3dbf4016eb71/PCH-MariaSilva-TEAM-20mb.jpg','Photography enthusiast',NULL,'2025-02-26 10:05:00','2025-02-27 20:31:47','active'),(14,'Thomas Mueller','thomas@example.com','2025-02-26 10:06:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+4923456789','https://media.cnn.com/api/v1/images/stellar/prod/180226153228-thomas-mueller-wink-thumbs-up.jpg','Looking for wedding photographers',NULL,'2025-02-26 10:06:00','2025-02-27 20:31:47','active'),(15,'Olivia Brown','olivia@example.com','2025-02-26 10:07:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+4412378945','https://oldvic.ac.uk/wp-content/uploads/2021/05/Olivia-Brown-1.jpg','Fashion model seeking portfolio photographers',NULL,'2025-02-26 10:07:00','2025-02-27 20:31:47','active'),(16,'James Wilson','james@example.com','2025-02-26 10:08:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+4423456123','https://www.cromwellhospital.com/wp-content/uploads/2024/04/Dr-James-Wilson.jpg','Business owner looking for product photography',NULL,'2025-02-26 10:08:00','2025-02-27 20:31:47','active'),(17,'Elena Petrova','elena@example.com','2025-02-26 10:09:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+7123456789','https://photos.lensculture.com/large/f6479db7-9ebf-4204-9f67-277145c37c37.jpg','Travel blogger needing destination photos',NULL,'2025-02-26 10:09:00','2025-02-27 20:31:47','active'),(18,'Ahmed Hassan','ahmed@example.com','2025-02-26 10:10:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+2012345678','https://en.etilaf.org/wp-content/uploads/2022/06/%D8%A3%D8%AD%D9%85%D8%AF-%D8%AD%D8%B3%D9%86-0.jpg','Family man looking for portrait sessions',NULL,'2025-02-26 10:10:00','2025-02-27 20:31:47','active'),(19,'Zoe Hamilton','zoe@example.com','2025-02-26 10:11:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+1234987650','https://7kbw.co.uk/wp-content/uploads/2022/08/ZOE-HAMILTON-022-1-scaled-e1663836738182.jpg','Event planner seeking photographers',NULL,'2025-02-26 10:11:00','2025-02-27 20:31:47','active'),(20,'Luis Garcia','luis@example.com','2025-02-26 10:12:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+3498765432','https://d3j2s6hdd6a7rg.cloudfront.net/v2/uploads/media/default/0001/15/thumb_14670_default_news_size_5.jpeg','Restaurant owner needing food photography',NULL,'2025-02-26 10:12:00','2025-02-27 20:31:47','active');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-03 18:15:19
