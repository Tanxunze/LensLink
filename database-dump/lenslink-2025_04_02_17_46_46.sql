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
INSERT INTO `bookings` VALUES (1,13,6,10,'2025-03-15','14:00:00','16:00:00','Hyde Park, London','Family of 5, including toddler','confirmed',350.00,'2025-02-26 11:00:00','2025-02-26 11:10:00'),(2,14,7,12,'2025-06-22','10:00:00','22:00:00','Parkview Manor, Toronto','Wedding ceremony and reception, 150 guests','confirmed',2500.00,'2025-02-26 11:30:00','2025-02-26 11:40:00'),(3,15,8,14,'2025-04-05','09:00:00','13:00:00','Studio Lumière, Paris','Portfolio update for modeling agency','confirmed',650.00,'2025-02-26 12:00:00','2025-02-26 12:15:00'),(4,16,10,18,'2025-03-28','08:00:00','14:00:00','Modern Office Tower, Tokyo','Architectural shots of new corporate headquarters','pending',750.00,'2025-02-26 12:30:00','2025-02-26 12:30:00'),(5,17,9,16,'2025-04-12','06:00:00','09:00:00','Coastal Path, Barcelona','Sunrise landscape photoshoot','confirmed',400.00,'2025-02-26 13:00:00','2025-02-26 13:10:00'),(6,18,6,11,'2025-03-10','10:00:00','11:00:00','Studio Portrait, London','Professional headshots for LinkedIn','completed',200.00,'2025-02-26 13:30:00','2025-02-26 14:30:00'),(7,19,7,13,'2025-05-18','18:00:00','23:00:00','Grand Hotel, Toronto','Corporate anniversary gala, 300 attendees','confirmed',800.00,'2025-02-26 14:00:00','2025-02-26 14:15:00'),(8,20,8,15,'2025-04-20','08:00:00','16:00:00','Le Bistro, Paris','Commercial shoot for restaurant menu and website','pending',1200.00,'2025-02-26 14:30:00','2025-02-26 14:30:00'),(9,13,9,17,'2025-05-05','07:00:00','19:00:00','Costa Brava, Spain','Travel magazine assignment','pending',900.00,'2025-02-26 15:00:00','2025-02-26 15:00:00'),(10,14,10,19,'2025-04-15','09:00:00','16:00:00','Luxury Apartment, Tokyo','Interior design photoshoot for real estate listing','confirmed',950.00,'2025-02-26 15:30:00','2025-02-26 15:45:00'),(11,7,5,9,'2025-03-01','13:25:00',NULL,'Limerick','Notesuhjkhjkjkhkhjkhjl','cancelled',2500.00,'2025-03-01 13:25:32','2025-03-28 00:00:23');
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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Wedding','wedding','Wedding photography services','2025-02-24 18:34:03','2025-02-24 18:34:03'),(2,'Portrait','portrait','Portrait photography services','2025-02-24 18:34:03','2025-02-24 18:34:03'),(3,'Event','event','Event photography services','2025-02-24 18:34:03','2025-02-24 18:34:03'),(4,'Commercial','commercial','Commercial photography services','2025-02-24 18:34:03','2025-02-24 18:34:03'),(5,'Landscape','landscape','Landscape photography services','2025-02-24 18:34:03','2025-02-24 18:34:03'),(6,'Paranormal','paranormal','Only Rick CAN DO','2025-03-03 15:44:00','2025-03-03 15:44:00'),(7,'Social Media','social-media','Social media photography and transformation services','2025-03-03 18:18:28','2025-03-03 18:18:28'),(8,'Pet','pet','Pet photography','2025-03-03 18:39:45','2025-03-03 18:39:45'),(9,'Dating App Profile','dating-app-profile','Specialized photography services for dating app profiles and online dating success','2025-03-03 18:41:56','2025-03-03 18:41:56');
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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversation_participants`
--

LOCK TABLES `conversation_participants` WRITE;
/*!40000 ALTER TABLE `conversation_participants` DISABLE KEYS */;
INSERT INTO `conversation_participants` VALUES (1,1,13,'2025-02-26 11:15:00','2025-02-26 10:30:00'),(2,1,8,'2025-02-26 11:10:00','2025-02-26 10:30:00'),(3,2,14,'2025-02-26 11:45:00','2025-02-26 11:20:00'),(4,2,9,'2025-02-26 11:40:00','2025-02-26 11:20:00'),(5,3,15,'2025-02-26 12:20:00','2025-02-26 11:50:00'),(6,3,10,'2025-02-26 12:15:00','2025-02-26 11:50:00'),(7,4,16,'2025-02-26 12:40:00','2025-02-26 12:25:00'),(8,4,12,'2025-02-26 12:35:00','2025-02-26 12:25:00'),(9,5,17,'2025-02-26 13:15:00','2025-02-26 12:45:00'),(10,5,11,'2025-02-26 13:10:00','2025-02-26 12:45:00'),(11,6,7,'2025-03-01 13:43:05','2025-03-01 13:43:05'),(12,6,5,NULL,'2025-03-01 13:43:05'),(13,7,7,'2025-03-28 16:28:03','2025-03-28 16:28:03'),(14,7,3,NULL,'2025-03-28 16:28:03');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (1,'Family Portrait Inquiry',1,'2025-02-26 10:30:00','2025-02-26 11:15:00'),(2,'Wedding Photography Discussion',2,'2025-02-26 11:20:00','2025-02-26 11:45:00'),(3,'Fashion Portfolio Session',3,'2025-02-26 11:50:00','2025-02-26 12:20:00'),(4,'Architectural Photography Project',4,'2025-02-26 12:25:00','2025-02-26 12:40:00'),(5,'Landscape Photography Session',5,'2025-02-26 12:45:00','2025-02-26 13:15:00'),(6,'test',NULL,'2025-03-01 13:43:05','2025-03-31 14:46:16'),(7,'Test message',NULL,'2025-03-28 16:28:03','2025-03-31 14:46:21');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (5,7,5,'2025-03-30 14:50:31'),(8,7,1,'2025-03-30 14:50:59');
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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,1,13,'Hi Emma, I\'m interested in booking a family portrait session for my family of 5. Do you have availability on March 15th?',1,'2025-02-26 10:30:00','2025-02-26 10:35:00'),(2,1,8,'Hello Maria! Yes, I have availability on March 15th. Would you prefer a studio session or outdoor location?',1,'2025-02-26 10:35:00','2025-02-26 10:40:00'),(3,1,13,'I think outdoors would be nice. Hyde Park perhaps?',1,'2025-02-26 10:40:00','2025-02-26 10:45:00'),(4,1,8,'Hyde Park would be perfect for a family shoot! I have 2pm-4pm available. Would that work for you?',1,'2025-02-26 10:45:00','2025-02-26 10:50:00'),(5,1,13,'That timing is perfect. We\'ll book it! Do you need any specific information about our family?',1,'2025-02-26 10:50:00','2025-02-26 10:55:00'),(6,1,8,'Great! It would be helpful to know the ages of your children and if you have any specific poses or styles in mind.',1,'2025-02-26 10:55:00','2025-02-26 11:00:00'),(7,1,13,'We have three children aged 2, 5, and 8. We\'d like natural, candid shots mainly, nothing too posed. Our 2-year-old can be a bit shy with strangers.',1,'2025-02-26 11:00:00','2025-02-26 11:05:00'),(8,1,8,'Thanks for letting me know! I\'m great with kids and will make sure everyone feels comfortable. I\'ll start with some group shots and then move to more playful candids to help your little one warm up.',1,'2025-02-26 11:05:00','2025-02-26 11:10:00'),(9,1,13,'That sounds perfect! Looking forward to it. Should I make the payment now?',1,'2025-02-26 11:10:00','2025-02-26 11:15:00'),(10,2,14,'Hello David, my fiancée and I are getting married on June 22nd and are looking for a wedding photographer. Are you available?',1,'2025-02-26 11:20:00','2025-02-26 11:25:00'),(11,6,7,'testmessage',0,'2025-03-01 13:43:05','2025-03-01 13:43:05'),(12,6,7,'testasjkhdadk',0,'2025-03-28 15:56:40','2025-03-28 15:56:40'),(13,6,7,'hello',0,'2025-03-28 15:56:53','2025-03-28 15:56:53'),(14,7,7,'asndlasjdjddj',0,'2025-03-28 16:28:03','2025-03-28 16:28:03'),(15,7,7,'afdff',0,'2025-03-28 16:28:08','2025-03-28 16:28:08'),(16,6,7,'dd',0,'2025-03-31 14:46:16','2025-03-31 14:46:16'),(17,7,7,'ddd',0,'2025-03-31 14:46:21','2025-03-31 14:46:21');
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000001_create_cache_table',1),(2,'0001_01_01_000002_create_jobs_table',1),(3,'2025_02_24_165119_create_personal_access_tokens_table',1),(4,'2025_03_02_003226_create_service_categories_table',2),(5,'2025_03_02_003523_migrate_service_categories',2),(6,'2025_03_02_005112_add_image_to_services_table',3),(7,'2025_03_30_153739_create_sessions_table',4);
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
) ENGINE=InnoDB AUTO_INCREMENT=98 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',2,'auth_token','27570cedb1912bf4e8919d4daaae405f972693384a5dca5e8a8d43004762b2a5','[\"*\"]','2025-02-24 17:53:40',NULL,'2025-02-24 17:45:56','2025-02-24 17:53:40'),(2,'App\\Models\\User',1,'auth_token','986be732c477c1add670db361b91194d8816c9852f9dd1c3bbd8b96da74679b2','[\"*\"]','2025-02-24 18:27:06',NULL,'2025-02-24 17:53:54','2025-02-24 18:27:06'),(48,'App\\Models\\User',21,'auth_token','fa95b6232e317d0b91a2cca7d9a7b89c12603b8bf496079f3222f4fd094aa01f','[\"*\"]','2025-03-07 18:43:28',NULL,'2025-03-07 18:43:27','2025-03-07 18:43:28'),(55,'App\\Models\\User',22,'auth_token','9cbe3c0be28858361716c3d7bbddbbd811683bcf99d9b9d5c6c76022e64a4671','[\"*\"]','2025-03-25 20:44:01','2025-03-26 20:41:56','2025-03-25 20:41:56','2025-03-25 20:44:01'),(58,'App\\Models\\User',21,'auth_token','9debd67cb2198fb746be85a36250ea3f0dfb974040c7db95e751cf7e55d17833','[\"*\"]','2025-03-26 18:00:26',NULL,'2025-03-26 18:00:23','2025-03-26 18:00:26'),(59,'App\\Models\\User',21,'auth_token','5cab5f4caea2d33259726184889b40041d6cf3bf5b11bf7dda8a4f2612863d30','[\"*\"]','2025-03-26 18:00:37',NULL,'2025-03-26 18:00:37','2025-03-26 18:00:37'),(60,'App\\Models\\User',21,'auth_token','f533e5a34d37b1216abc0294c66267569938c1d3360bd761c032731f2d1968cd','[\"*\"]','2025-03-26 18:01:02',NULL,'2025-03-26 18:01:02','2025-03-26 18:01:02'),(61,'App\\Models\\User',21,'auth_token','af3de3a6a023fbcf917ec4e7b37d853e66fe45b53196975a64bbaaf209196605','[\"*\"]','2025-03-26 18:39:39',NULL,'2025-03-26 18:39:38','2025-03-26 18:39:39'),(62,'App\\Models\\User',21,'auth_token','3da7c23e14dc9290b82b974230eb38d99d5dd61ee4d1c9dd1045a76c3f36aff7','[\"*\"]',NULL,NULL,'2025-03-27 21:12:49','2025-03-27 21:12:49'),(63,'App\\Models\\User',21,'auth_token','bf41411c09ddd0c3579ac63e57392fd767c6eaadf562b5fa4f1b8d86ccf21d53','[\"*\"]',NULL,NULL,'2025-03-27 21:13:23','2025-03-27 21:13:23'),(84,'App\\Models\\User',3,'auth_token','5550430ece2349b1c4702bba8e5b1c5d9b2afd950e80b462355375c16f34a020','[\"*\"]','2025-03-28 16:31:12','2025-03-29 16:31:12','2025-03-28 16:31:12','2025-03-28 16:31:12'),(97,'App\\Models\\User',7,'auth_token','d218eba3569e8690efbe3b9ba57ee71a9ee83d75f8c43c7e0e0dfb541ba6e6cc','[\"*\"]','2025-03-31 14:47:08','2025-04-01 14:45:57','2025-03-31 14:45:57','2025-03-31 14:47:08');
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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photographer_categories`
--

LOCK TABLES `photographer_categories` WRITE;
/*!40000 ALTER TABLE `photographer_categories` DISABLE KEYS */;
INSERT INTO `photographer_categories` VALUES (1,1,1,'2025-02-24 18:34:03'),(3,2,1,'2025-02-24 18:34:03'),(6,4,5,'2025-02-24 18:34:03'),(7,5,6,'2025-02-24 18:34:03'),(8,5,3,'2025-02-24 18:34:03'),(9,6,2,'2025-02-26 10:00:00'),(10,6,4,'2025-02-26 10:00:00'),(11,7,1,'2025-02-26 10:01:00'),(12,7,3,'2025-02-26 10:01:00'),(13,8,2,'2025-02-26 10:02:00'),(14,8,4,'2025-02-26 10:02:00'),(15,9,5,'2025-02-26 10:03:00'),(16,10,4,'2025-02-26 10:04:00'),(17,10,5,'2025-02-26 10:04:00'),(18,2,7,'2025-03-03 18:19:11'),(19,3,9,'2025-03-03 18:42:05');
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
INSERT INTO `photographer_profiles` VALUES (1,1,'Wedding',5,150,'New York, USA',1000.00,'https://x.dkphoto.ie/wp-content/uploads/2019/12/Wedding-Photographer-Louth.jpg',1,1,4.85,48,'2025-02-24 18:34:03','2025-03-03 17:28:25'),(2,2,'Social Media',7,220,'Los Angeles, USA',150.00,'https://www.chrisboland.com/wp-content/uploads/2024/01/styles-1.jpg',1,1,4.90,63,'2025-02-24 18:34:03','2025-03-03 18:22:54'),(3,3,'Dating App Profiles',3,85,'Chicago, USA',120.00,'https://images.squarespace-cdn.com/content/v1/5e5ae71a84c33538245867b1/1635372816220-9IQUR3A69V3D9U0N1WFL/shutterstock_1936696738+%281%29.jpg',1,1,4.92,32,'2025-02-24 18:34:03','2025-03-03 18:42:05'),(4,4,'Pet',8,120,'Seattle, USA',120.00,'https://www.watchmojo.com/uploads/thumbs720/WM-TV-Top-10-Times-Brian-Griffin-Got-What-He-Deserved-on-Family-Guy_W4Q1M1-2F.jpg',0,1,4.80,41,'2025-02-24 18:34:03','2025-03-03 18:33:26'),(5,5,'Paranormal Portfolio Photography',6,175,'Miami, USA',200.00,'https://media.gq.com/photos/6577b95756b753fcf473be4b/4:3/w_1440,h_1080,c_limit/AS_RAM_709_RickfendingYourMort-10.png',1,1,5.00,37,'2025-02-24 18:34:03','2025-03-03 16:09:54'),(6,8,'Portrait & Family',10,240,'London, UK',120.00,'https://www.barrettandcoe.co.uk/bcwp/wp-content/uploads/2016/04/barrett-coe-family-photograpy-084.jpg',1,1,4.80,52,'2025-02-26 10:00:00','2025-02-27 20:39:10'),(7,9,'Wedding & Event',8,180,'Toronto, Canada',180.00,'https://d1hjkbq40fs2x4.cloudfront.net/2016-11-10/files/Canon-snapshot-minimalist-photography-3.jpg',0,1,4.85,39,'2025-02-26 10:01:00','2025-03-03 18:21:13'),(8,10,'Fashion & Editorial',6,95,'Paris, France',220.00,'https://academy-cdn.wedio.com/2021/10/editorial-photography-fun-1.jpg',1,1,4.75,28,'2025-02-26 10:02:00','2025-02-27 20:39:10'),(9,11,'Travel & Landscape',12,310,'Barcelona, Spain',150.00,'https://www.diyphotography.net/wp-content/uploads/2019/01/Aquamarine.jpg',0,1,4.90,47,'2025-02-26 10:03:00','2025-02-27 20:39:10'),(10,12,'Landscape & Commercial',9,125,'Tokyo, Japan',190.00,'https://www.tokyoweekender.com/wp-content/uploads/2018/07/Differentkind_1500px.jpg',1,1,4.95,36,'2025-02-26 10:04:00','2025-03-03 17:55:10');
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `portfolio_items`
--

LOCK TABLES `portfolio_items` WRITE;
/*!40000 ALTER TABLE `portfolio_items` DISABLE KEYS */;
INSERT INTO `portfolio_items` VALUES (1,1,'Summer Wedding','Beautiful summer wedding in Central Park','https://images.squarespace-cdn.com/content/v1/52c01bc6e4b0816e9a8d12d6/2eb512a7-aacd-4007-b0c1-9c541531eb82/080__chicheley-hall-wedding-photography.jpg',1,1,1,'2025-02-24 18:34:03','2025-02-27 20:49:55'),(2,1,'Fantasy Wedding','Gorgeous lights and happy couple','https://images.squarespace-cdn.com/content/v1/5a78b94a90bade124da7b30d/1635153472269-PCCG6DESQ7NKLT6UEE3H/247933523_260841486053247_8557544500249407555_n.jpg',1,1,2,'2025-02-24 18:34:03','2025-03-03 17:24:41'),(3,2,'Sunrise','Yes, that\'s you in the photo.','https://www.theblondeabroad.com/wp-content/uploads/2016/11/africa-cape-town-photography.jpg',7,1,1,'2025-02-24 18:34:03','2025-03-03 18:19:17'),(4,2,'Successful ig accounts','It works - at least I think so!','https://www.hopperhq.com/wp-content/uploads/2017/02/justgoshoot.png',7,0,2,'2025-02-24 18:34:03','2025-03-03 18:19:17'),(7,4,'Glamour Dog','I love her.','https://media.istockphoto.com/id/172409492/photo/movie-star-poodle-striking-a-pose.jpg?s=612x612&w=0&k=20&c=zVU1W01eMWVBAIqfr3cnUz8nHxXHnZzDE3oziB872Zg=',8,1,1,'2025-02-24 18:34:03','2025-03-03 18:40:35'),(8,4,'Fashionable Dog','Dramatic.','https://media.istockphoto.com/id/538728353/photo/crowned-chihuahua-sunbathing.jpg?s=612x612&w=0&k=20&c=s-wRjPjNttnkCTYZ9txU-IYYginLI6QryLtmoHY_89M=',8,0,2,'2025-02-24 18:34:03','2025-03-03 18:40:35'),(9,5,'Ethereal Presence','Subtle lighting techniques capturing mysterious shadows and apparitions','https://static1.srcdn.com/wordpress/wp-content/uploads/2020/12/Rick-and-morty-King-Jellybean.jpg',6,1,1,'2025-02-24 18:34:03','2025-03-03 18:18:41'),(10,5,'Unexplained Phenomena','Documentation of unusual light patterns often associated with paranormal activity','https://wallpapersok.com/images/hd/rick-and-morty-inside-a-ufo-sad-ae71o9pdo8rtii95.jpg',6,0,2,'2025-02-24 18:34:03','2025-03-03 18:18:41'),(11,6,'Family Portrait Session','At least we don\'t have to buy a Christmas tree.','https://assets.yellowtrace.com.au/wp-content/uploads/2016/12/Awkward-Family-Portraits-by-Morten-Borgestad-Yellowtrace-1200x520.jpg\n',2,1,1,'2025-02-26 10:00:00','2025-03-03 18:30:20'),(12,6,'Corporate Headshots','Professional headshots for a finance team','https://frameshot.co.uk/wp-content/uploads/Corporate-Headshot-on-black-background-002_00254.jpg',4,0,2,'2025-02-26 10:00:01','2025-02-27 20:49:55'),(13,7,'Spring Garden Wedding','Elegant outdoor wedding ceremony and reception','https://images.squarespace-cdn.com/content/v1/5824c6435016e1578012dcdf/b33a6157-e268-47a3-bfff-5fbb0f357dea/Picture1.jpg',1,1,1,'2025-02-26 10:01:00','2025-02-27 20:49:55'),(14,7,'Corporate Anniversary','Large-scale corporate event with 500+ attendees','https://www.aiglobalmedialtd.com/wp-content/uploads/2023/03/Corporate-Anniversary-Marketing-How-Can-Businesses-Celebrate-Their-Milestones.jpg',3,0,2,'2025-02-26 10:01:01','2025-02-27 20:49:55'),(15,8,'Vogue Editorial','High fashion editorial for major magazine','https://assets.vogue.com/photos/5e975989468f4b000812b630/master/w_1600%2Cc_limit/VO0520_Archive_01.jpg',2,1,1,'2025-02-26 10:02:00','2025-02-27 20:49:55'),(16,8,'Designer Lookbook','Spring collection lookbook for fashion designer','https://images.squarespace-cdn.com/content/v1/56e01a657da24fcf36df5816/1483823504672-U71OOUT9VD9FKSWFINP5/High-end-lookbook-photographer-London.jpg',4,0,2,'2025-02-26 10:02:01','2025-02-27 20:49:55'),(17,9,'Scottish Highlands','Dramatic landscape series from Scotland','https://i0.wp.com/ugoceiphotography.com/wp-content/uploads/2015/10/20150921-XE2S3192-HDR.jpg',5,1,1,'2025-02-26 10:03:00','2025-02-27 20:49:55'),(18,9,'Moroccan Journey','Travel documentary series from Morocco','https://www.darioendara.com/wp-content/uploads/2020/04/01-ait-ben-haddou-morocco-travel-photography.jpg',5,0,2,'2025-02-26 10:03:01','2025-02-27 20:49:55'),(19,10,'Tokyo Perspectives','Minimalist architectural studies of Tokyo','https://www.datocms-assets.com/101439/1700293204-tokyo-night-view.webp',5,1,1,'2025-02-26 10:04:00','2025-02-27 20:49:55'),(20,10,'Modern Interiors','Clean, minimalist interior design photography','https://www.windermere.com/files/2022/06/Blog-Featured-Image-1240-x-480-contemporary.png',4,0,2,'2025-02-26 10:04:01','2025-02-27 20:49:55'),(21,3,'Profile Transformation: James','Before and after profile makeover that increased match rate by 300%','https://resizing.flixster.com/-XZAfHZM39UwaGJIFWKAE8fS0ak=/v3/t/assets/29054_v9_ba.jpg',9,1,1,'2025-03-03 18:43:02','2025-03-03 18:45:45'),(22,3,'Outdoor Lifestyle Session','Natural, candid shots that showcase authentic personality','https://images.squarespace-cdn.com/content/v1/5804f37703596e417ce39f7f/1621438097167-W3T7TF3C9TMRUETFG4YG/Sussex+Brighton+Hove+Soulful+Outdoor+Lifestyle+Brand+Portrait+Headshot+Female+Photographer+_.jpg',9,0,2,'2025-03-03 18:43:02','2025-03-03 18:45:45'),(23,3,'Professional Yet Approachable','Corporate professional seeking balanced profile for dating success','https://www.corporatephotographylondon.com/wp-content/uploads/2017/06/approachable-professional-headshots_1.jpg',9,1,3,'2025-03-03 18:43:02','2025-03-03 18:45:45');
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
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_categories`
--

LOCK TABLES `service_categories` WRITE;
/*!40000 ALTER TABLE `service_categories` DISABLE KEYS */;
INSERT INTO `service_categories` VALUES (1,1,1,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(2,2,1,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(3,3,7,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(4,4,7,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(5,5,2,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(6,6,2,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(7,7,8,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(10,10,2,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(11,11,2,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(12,12,1,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(13,13,3,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(14,14,2,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(15,15,4,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(16,16,5,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(17,17,5,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(18,18,4,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(19,19,4,'2025-03-02 00:37:05','2025-03-02 00:37:05'),(20,8,6,NULL,NULL),(21,9,6,NULL,NULL),(22,20,9,'2025-03-03 18:42:18','2025-03-03 18:42:18'),(23,21,9,'2025-03-03 18:42:18','2025-03-03 18:42:18'),(24,22,9,'2025-03-03 18:42:18','2025-03-03 18:42:18');
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
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `service_features`
--

LOCK TABLES `service_features` WRITE;
/*!40000 ALTER TABLE `service_features` DISABLE KEYS */;
INSERT INTO `service_features` VALUES (1,1,'4 hours coverage',1,'2025-02-24 18:34:03'),(2,1,'100 edited digital photos',2,'2025-02-24 18:34:03'),(3,1,'Online gallery delivery',3,'2025-02-24 18:34:03'),(4,2,'8 hours coverage',1,'2025-02-24 18:34:03'),(5,2,'300 edited digital photos',2,'2025-02-24 18:34:03'),(6,2,'Second photographer',3,'2025-02-24 18:34:03'),(7,2,'Premium photo album',4,'2025-02-24 18:34:03'),(8,3,'Multiple Account Support',1,'2025-02-24 18:34:03'),(9,3,'Customisable with all content',2,'2025-02-24 18:34:03'),(10,4,'Choose whatever you want to wear',1,'2025-02-24 18:34:03'),(11,4,'Unlimited photos',2,'2025-02-24 18:34:03'),(12,4,'Premium photo album',3,'2025-02-24 18:34:03'),(13,4,'Engagement session included',4,'2025-02-24 18:34:03'),(14,5,'20 edited photos',1,'2025-02-24 18:34:03'),(15,5,'Professional retouching',2,'2025-02-24 18:34:03'),(16,10,'2-hour session at your chosen location',1,'2025-02-26 10:00:00'),(17,10,'20 professionally edited digital photos',2,'2025-02-26 10:00:00'),(18,10,'Online gallery for sharing',3,'2025-02-26 10:00:00'),(19,10,'Print packages available',4,'2025-02-26 10:00:00'),(20,11,'1-hour studio session',1,'2025-02-26 10:00:01'),(21,11,'5 professionally edited digital headshots',2,'2025-02-26 10:00:01'),(22,11,'Quick turnaround (48 hours)',3,'2025-02-26 10:00:01'),(23,12,'12 hours of wedding day coverage',1,'2025-02-26 10:01:00'),(24,12,'Second photographer included',2,'2025-02-26 10:01:00'),(25,12,'500+ edited digital photos',3,'2025-02-26 10:01:00'),(26,12,'Premium wedding album',4,'2025-02-26 10:01:00'),(27,12,'Engagement session included',5,'2025-02-26 10:01:00'),(28,13,'5 hours of event coverage',1,'2025-02-26 10:01:01'),(29,13,'200+ edited digital photos',2,'2025-02-26 10:01:01'),(30,13,'48-hour preview delivery',3,'2025-02-26 10:01:01'),(31,8,'Professional lighting and effects',1,'2025-03-03 18:19:29'),(32,8,'Unique scene composition',2,'2025-03-03 18:19:29'),(33,8,'Digital enhancements included',3,'2025-03-03 18:19:29'),(34,9,'Full overnight investigation',1,'2025-03-03 18:19:29'),(35,9,'Documentation of all unusual phenomena',2,'2025-03-03 18:19:29'),(36,9,'Complete report with findings',3,'2025-03-03 18:19:29'),(37,9,'High-resolution images of all evidence',4,'2025-03-03 18:19:29'),(38,20,'60-minute professional photoshoot',1,'2025-03-03 18:42:25'),(39,20,'3-5 professionally edited photos',2,'2025-03-03 18:42:25'),(40,20,'24-hour turnaround time',3,'2025-03-03 18:42:25'),(41,20,'Digital delivery of final images',4,'2025-03-03 18:42:25'),(42,21,'3-hour comprehensive session',1,'2025-03-03 18:42:25'),(43,21,'Multiple outfit changes (up to 4)',2,'2025-03-03 18:42:25'),(44,21,'2-3 different locations',3,'2025-03-03 18:42:25'),(45,21,'Profile review and optimization advice',4,'2025-03-03 18:42:25'),(46,21,'15 professionally edited photos',5,'2025-03-03 18:42:25'),(47,21,'Priority editing (48-hour delivery)',6,'2025-03-03 18:42:25'),(48,22,'2-hour activity-based photoshoot',1,'2025-03-03 18:42:25'),(49,22,'Photos of you engaged in 2-3 hobbies/activities',2,'2025-03-03 18:42:25'),(50,22,'10 professionally edited photos',3,'2025-03-03 18:42:25'),(51,22,'Conversation starter recommendations',4,'2025-03-03 18:42:25'),(52,22,'72-hour delivery of final images',5,'2025-03-03 18:42:25');
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
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,1,'Basic Wedding Package','Coverage of ceremony and reception',1000.00,240,'package',0,1,'https://thefennells.ie/source/wp-content/uploads/2020/11/Wedding-Photography-5852-1024x684.jpg','2025-02-24 18:34:03','2025-03-02 14:38:09'),(2,1,'Premium Wedding Package','Full day coverage including preparations',2000.00,480,'package',1,1,'https://connectart.io/wp-content/uploads/2024/08/Rafaella-1.webp','2025-02-24 18:34:03','2025-03-02 14:38:09'),(3,2,'Basic Instagram glow-up package','Give you fantastic life record',500.00,360,'package',0,1,'https://www.wedgewoodweddings.com/hubfs/3.0%20Feature%20Images%201000%20x%20500%20px/Blog/Wedding-Album-Trends.png','2025-02-24 18:34:03','2025-03-03 18:03:13'),(4,2,'\"Vacation Without Traveling\"','Sitting at home, shooting outside',1500.00,720,'package',1,1,'https://www.honeytribephoto.com/wp-content/uploads/2022/01/honey-tribe-photo-wedding-album-0066-large.jpg','2025-02-24 18:34:03','2025-03-03 18:04:59'),(5,3,'Portrait Session','Standard portrait photography session',150.00,60,'hour',1,1,'https://images.squarespace-cdn.com/content/v1/5b15bd7889c1720c3a901616/1676586896134-PUIK7I3V0S96UUAVDON5/IMG_9621.jpg','2025-02-24 18:34:03','2025-03-02 14:38:09'),(6,3,'Fashion Portfolio','Professional fashion portfolio shoot',500.00,180,'session',0,1,'https://theloftstudio.ae/assets/images/resources/15/spring-127-result.jpg','2025-02-24 18:34:03','2025-03-02 14:38:09'),(7,4,'Ready for a date.','I\'d love to kiss you, miss.',500.00,120,'session',1,1,'https://lauradouglasphoto.co.uk/wp-content/uploads/2021/05/Laura_Douglas_Surrey_Family_Photography-57-1.jpg','2025-02-24 18:34:03','2025-03-03 18:34:48'),(8,5,'Paranormal Scene Photography','Specialized photography creating supernatural and otherworldly scenes with professional effects',100.00,60,'hour',0,1,'https://pixc.com/wp-content/uploads/2019/07/DIY-product-photography-hacks-featured.jpg','2025-02-24 18:34:03','2025-03-03 18:18:34'),(9,5,'Extended Paranormal Investigation Package','Complete documentation of locations with alleged paranormal activity, including overnight sessions and specialized equipment',2500.00,480,'project',1,1,'https://weedit.photos/wp-content/uploads/2022/05/famous-advertising-photographers-cover.jpg','2025-02-24 18:34:03','2025-03-03 18:18:34'),(10,6,'Awkward Family Portraits Package','Give you the most embarrassing experience with multiple poses and settings ideal for families of all sizes',350.00,120,'session',1,1,'https://images.squarespace-cdn.com/content/v1/5aa1d0d74eddec4032868b2c/1563321550343-ICTY6SN2FHNL1DG2WEE3/Southlake+Family+Photographer','2025-02-26 10:00:00','2025-03-03 18:26:32'),(11,6,'Professional Headshots','Corporate and professional headshots with multiple outfit changes',200.00,60,'session',0,1,'https://images.squarespace-cdn.com/content/v1/5e2f9e7539df801c9548a5a1/1591931835413-UXMIM4RN4R9FXB2YO3UE/Dallas+Headshot+Photographer%2C+Jason+Kindig','2025-02-26 10:00:01','2025-03-02 14:38:09'),(12,7,'Complete Wedding Package','Full day wedding coverage from preparations to reception',2500.00,720,'package',1,1,'https://www.stewalkerphotography.com/wp-content/uploads/2022/01/Winter-Wedding-Adare-Manor57.jpg','2025-02-26 10:01:00','2025-03-02 14:38:09'),(13,7,'Event Photography','Corporate event or party coverage with professional editing',800.00,300,'event',0,1,'https://www.photo8.co.uk/wp-content/uploads/2020/01/Birmingham-event-photographer.jpg','2025-02-26 10:01:01','2025-03-02 14:38:09'),(14,8,'Fashion Portfolio','Professional fashion portfolio shoot for models',650.00,240,'session',1,1,'https://i.etsystatic.com/20116942/r/il/33efb7/5218437201/il_1080xN.5218437201_i3rm.jpg','2025-02-26 10:02:00','2025-03-02 14:38:09'),(15,8,'Commercial Fashion','Commercial fashion shoot for brands and designers',1200.00,480,'day',0,1,'https://images.squarespace-cdn.com/content/v1/56e01a657da24fcf36df5816/1483823504672-U71OOUT9VD9FKSWFINP5/High-end-lookbook-photographer-London.jpg','2025-02-26 10:02:01','2025-03-02 14:38:09'),(16,9,'Landscape Fine Art','Landscape photography with fine art prints included',400.00,180,'session',1,1,'https://cdn.fstoppers.com/styles/large-16-9/s3/lead/2017/11/isabella_tabacchi_-_landscape_photography_-_lenticular-shades.jpg','2025-02-26 10:03:00','2025-03-02 14:38:09'),(17,9,'Travel Documentary','Travel documentary photography for publications',900.00,480,'day',0,1,'https://www.productionparadise.com/newsletters/1841/photos/stefan-Nimmesgern-Munich-Madeira-travel-documentary-photography-social.jpg','2025-02-26 10:03:01','2025-03-02 14:38:09'),(18,10,'Architectural Portfolio','Architectural photography for portfolios and publications',750.00,360,'project',1,1,'https://media.apalmanac.com/wp-content/uploads/2021/01/04_Postcard_Portfolio_Apalmanac-1536x864.jpg','2025-02-26 10:04:00','2025-03-02 14:38:09'),(19,10,'Interior Design Package','Complete interior design photography for properties',950.00,420,'project',0,1,'https://www.decorilla.com/online-decorating/wp-content/uploads/2023/12/Modern-interior-design-ideas-for-a-living-room-by-Decorilla-1024x574.jpeg','2025-02-26 10:04:01','2025-03-02 00:54:09'),(20,3,'Basic Profile Refresh','Quick session to capture 3-5 high-quality photos designed to improve your dating profile immediately',120.00,60,'session',0,1,'https://images.ctfassets.net/h6goo9gw1hh6/RVoyMWRwLWiYFOd2MTpPV/1055eaefb626e3a8ef9bac67f8e1e5e5/4-sm-a.jpg?w=1200&h=600&fl=progressive&q=70&fm=jpg','2025-03-03 18:42:13','2025-03-03 18:52:27'),(21,3,'Complete Dating App Makeover','Comprehensive session with multiple outfit changes, locations, and professional styling advice to create a diverse, authentic profile that showcases your personality',350.00,180,'package',1,1,'https://www.corporatephotographylondon.com/wp-content/uploads/2017/06/approachable-professional-headshots_1.jpg','2025-03-03 18:42:13','2025-03-03 18:52:27'),(22,3,'Activity-Based Dating Profile','Capture you engaged in your favorite hobbies and activities to create an authentic, dynamic profile that sparks conversation',250.00,120,'session',0,1,'https://media.licdn.com/dms/image/v2/C4E12AQG-pc3hfzJZBQ/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1537213857733?e=2147483647&v=beta&t=77O_HxXnW_NUi-pu6D08xiu5N5FwjNSMfgxP-eRK0L4','2025-03-03 18:42:13','2025-03-03 18:52:27');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sessions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('10RPxgI8Ayfx3r3q1hNRrOigPXEfQO35ljB02xoT',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVkt6aHl1bm5KQTI3OWJaV09ZTFptbjczUWk1djZzWklQUTRjWnhKcSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743350060),('12zgxgCZYdkeWGjR9dqUa6onl2qxvjrlcerJQEG4',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiY0VhQ3BvVUltb2M3dUNqUDVkYThTaEtIZHl1MnJ4YWhMNGY1YlVqSiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTMzOTlfYl8wYWVkMzdkYTVmN2NiNzIzMThiYmE0MGYzN2NlMGI1Zi5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743353400),('1mYERREeP0KaWB64MuWdSRmUY96bsyZKnkFxJt33',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiV2NtZldmYzBYZ1MzSlVtSktja1FmeVJ1eU9abnBhMUlBTnhTWEtlQiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743349897),('3kosg2z7cv6ehUfYJFWpTtgMa5H9pGfKgsLsrpNM',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiSDNaTVl3MUc4a2s2Yjl0WFpyNWR0S0hPaWFhMFJPeWtrZ29pRGVISyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTUzNTBfYl8wMjgwM2RjN2VjYmY4OWE2ZjA2MTc0MmZkMGU1ZmZiYS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743355350),('3zpz1z1ujqfbMpLOafEOlLgMwmJsCSOQgg6UBeKD',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiZW9OQkpObGt1bmd2SVNhZ3hHcXJBUzh6RGdVcmxQejNjVlp5M1AyZSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743349987),('4JJDYOLCtgoFX5RDmxvqcL8J5ZnxJjPWrsKF73ef',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiOU1tTjU1MGtkaTA3cXF2SE1mTEZEWTNsNUVjaFZWQUpURXZGTkxaUiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTMzOTlfYl8wYWVkMzdkYTVmN2NiNzIzMThiYmE0MGYzN2NlMGI1Zi5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743354443),('5ULqRVhGUYvnmgrGtPyET83gAObnUGfmAEfIDBds',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoib0dOZTA4eERabEdCcVNMUzNkZWtOUDFtSno3U2FFN1VOUDV6NG5iMCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NjU6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9pbWFnZXMvcHJvZmlsZS8xNzQzMzUyMzI1XzY3ZTk3MjA1NjI2Y2UuanBnIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743352646),('6DsQtTW5SeBi1qqELvENgFbgaOc5DhGDl1N6yBcG',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiTTBWS1hhNE9aYllTOUlSQWtpV2pLZ3JXRU9RMTJKZkJFamsyelN2ZiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743349933),('7qWjzsLwBbbgynjsu9fvmuqn9Z1RDsZIIqmmgtz6',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUVBSOEVhTEJYVjFackhabFlIZkRTN2FKbzh6ZTRmZFJ3UDhUOGZmTyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTUzNTBfYl8wMjgwM2RjN2VjYmY4OWE2ZjA2MTc0MmZkMGU1ZmZiYS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743355554),('8qjh4EZ50IMroDfQfFfIh8VGOGXrYmUlPvZMvARx',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiOHNlZndia2JoblQ0OFhxd1RMelU4c1RGQm10eXNpNldpc0Z3Z1k0bCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743349639),('9BJcpuJVCfi5PCR7vbv2flHBG7ybXHt3nh4DxW8n',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoieEU2TDg1REV5TXFZMkY4WXVkOWVQSkJEaTF4S0JSbHkwaHA1SWxHTSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTUzNTBfYl8wMjgwM2RjN2VjYmY4OWE2ZjA2MTc0MmZkMGU1ZmZiYS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743355565),('9vIlp4smAtfId3MkWrOJdH0hJXhYeuKghJqngLZp',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoibVR3R0lCQ1loSXdQZDQ1aFBsanFwQm5RYWJHWTdnOUZDcDFGenczdiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Njk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGVfaW1hZ2VzL3Byb2ZpbGVfN18xNzQzNDE2NDc3LmpwZyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1743416477),('9WP5gSrbQHtBiBtdQind7XgNe9DwXNhVsixz74hh',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiR3Uxcmw1MWpacnVTQVcwTVVQNDF6RDBlT3c4cUlmanFhem9EaG5BdyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743349256),('9z6l1kWfFRpkPFMAAnVrCLudlOLzChR5TzTnLikG',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUE9UN3BBRE9ZOTl0aFN1aVhyU0xaa0pkVEROekNIeHpja2hLZ2swUCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTUzNTBfYl8wMjgwM2RjN2VjYmY4OWE2ZjA2MTc0MmZkMGU1ZmZiYS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743355517),('ANobnu6IFfTnjFNmDwmfWIBInTb9aBTgT5cMg9j8',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRjltNFJWVXg5cVd0eGZIZFVpcDFpTXZIZkRaYjhBZnVqSkNJT0d1dyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTQ1MTlfYl9jZjQ4MGQ4NmI4YTQwZmVjYzQyMGIxN2ViMWVmYzdlMS5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743354996),('BaajYLNkpi5GQE0Coveba8D60UzVWKZU5LIOng79',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiWm1oWkd4RDZ0bFRBejltSkFlY0hJVEkzeXFzUnE0ck9mMEJPZTRqVCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743351733),('Bn3pl4evUK56tz7IwaLH6inISNy38HTcJpngIHpG',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiYmpQT3pZS0hpTFFYU2hXcktLUnYzZnJpcVRCNFlhSmt6eTJiUWpSZCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743350078),('E4sE2X7kwaSUtzaTD3qKi96L7iZ63Iz5114YlkvC',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoieE1HVkdmbjdQcXducjlPRllmSUk1MG9QVWxUU0E2Mm1ONXVYbTdjeSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTQ1MTlfYl9jZjQ4MGQ4NmI4YTQwZmVjYzQyMGIxN2ViMWVmYzdlMS5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743354993),('eaJmgjBPleUP6C9lXFdSxaeyC0KkxOUhsLXHnITM',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiYTduT2xLT3NZZEN1SXd0MktVcFJ5cTNzS1pXYmtLSkt5b0xQYnpJOSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NjU6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9pbWFnZXMvcHJvZmlsZS8xNzQzMzUyMzI1XzY3ZTk3MjA1NjI2Y2UuanBnIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743352829),('ehvRd3OXuwDy4G1X5DV2dP1MqpLjYI9ZBd42YUXD',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVng0SmpQQnpCbVdVNnpJYnFPYjczaEkzOFRtVmQ0TFVHUDJnSG9WVCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTUzNTBfYl8wMjgwM2RjN2VjYmY4OWE2ZjA2MTc0MmZkMGU1ZmZiYS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743355560),('eSorpXbnsh8o8fMzaACf8SdcnN04JSeeCULIfFUc',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoic0xqTDVWUW9nSVZ5Y0dQTGZjSng3MTU5S2lWdjBvc3JiVGFRWWxVdCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTQ1MTlfYl9jZjQ4MGQ4NmI4YTQwZmVjYzQyMGIxN2ViMWVmYzdlMS5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743355022),('FZxq3O1bZeA4AFkt12BY4252qecZKMywZgVTnn3W',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNU5jOEFhak9FQlplQ3FkaE5oZHY4WFJtVW1weWY5YjF5VzkxcDRvayI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTMzOTlfYl8wYWVkMzdkYTVmN2NiNzIzMThiYmE0MGYzN2NlMGI1Zi5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743354363),('GYvvv4fhr9hES0SnvtX8HouzNk5NBGVYW6psmdHA',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoianhoYW9OTDUwbzNjOEZjQ0s3OE5tTGd3bk5aazBscGtoWGZCUmRJTSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MzM6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9mYXZpY29uLmljbyI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1743355595),('hcrr1GfOidMZo0AkY3myJUXPb0TLSnyRba08zkxN',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiTGl2WGJNTHo3SXd6QUxTRnhYRTN1cUJubkI3N0pkcFpBM2tpTkhRcCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NjE6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9pbWFnZXMvcHJvZmlsZXMvcHJvZmlsZV9fMTc0MzQxNjg1My5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743417038),('HJRSnFN5caavCYqDgkIzDi2ot87odHXrei9wDw4n',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiOW5yc0FJUGZkVVJTMTRTaUZlVWh3QVJxbnRaNWxEd0lJZWJWQldURyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTQ0ODZfYl8wMjgwM2RjN2VjYmY4OWE2ZjA2MTc0MmZkMGU1ZmZiYS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743354486),('HKmWiwUA4Gg5rX2HrFzdD8y47Rmos8NH470iLvI5',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVEoxR3Z4N3phZklreEZocXVHdFJGZUluVU1ValJsdmIyelJrb01aRCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743351832),('HshotJTCqTjPaXOBBtb6LZKZJ8IbRl8nYu8dR6Xa',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRGVBZzlSRUk5eDA2bnd3Z3lWWnpHR3g0TUtMT0xrNTFxSGVEZ3cyWSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743349633),('iEvsgXt0nVALZ6L7hcLTGvDqha5DqaaZkAQId5A8',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoic3RtWjR3NUpLQTRzSG1TbkNSc2RHazA1T2JiMDlXZm1UMFB1ZndUcyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTUzNTBfYl8wMjgwM2RjN2VjYmY4OWE2ZjA2MTc0MmZkMGU1ZmZiYS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743355413),('isfSqqUOjQsVWh9Zw3tzfgmdzzoA3BdKXvGnUQtK',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoibnZZeGdTZXpBZUMzSmY0Y3N0TU41NE12TWxhNE5oeVAxTVZDek81ZCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTUzNTBfYl8wMjgwM2RjN2VjYmY4OWE2ZjA2MTc0MmZkMGU1ZmZiYS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743355351),('jXh8IchcgkUyAnKZweob4k3ZWDTeMdr0hPlEFjsi',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiZFlQOU9nTjZkNkZvUWhFYWZHR3loV2VuaFp6SFI2b0tRYzk2UlgwUyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTUzNTBfYl8wMjgwM2RjN2VjYmY4OWE2ZjA2MTc0MmZkMGU1ZmZiYS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743355576),('k2WkpPexb7WpwX4VVy8xDxcuSz3ofXlePRhUDdCP',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiZW9XSFVSa1Q3SXNKOUZMemx0emZZVGY0aHlOYkFDNUFTMXVEbWRhQyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743349987),('lgAbuQBeBdovMpOh9W0GeJImin0c3pu053LLaAnj',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNkFsdVhtSnhvSEdvdGJWQmRpY3dXVE0wV052VEJKd0VhNVJzU05mNiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTMzOTlfYl8wYWVkMzdkYTVmN2NiNzIzMThiYmE0MGYzN2NlMGI1Zi5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743354279),('lHHP7t7ByIAMErrcjSnn8sarMGUloO5uStZ97LtR',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoid1VuZmt5aWluTlFiMGJ1VmdlY2EyRW8xV2JVNnlzN0RmV1JCY1lLbyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTQ0ODZfYl8wMjgwM2RjN2VjYmY4OWE2ZjA2MTc0MmZkMGU1ZmZiYS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743354486),('m3EUTn2lHe3WD5A01iAXXy8cWhO8HQHkC9W79XzV',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiWEVsNG5wRURucU8wT0UzelgwY0Z6d0JzNTVSRU5qWE5TR0IxcXNJWSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743351985),('MxZ37YRvzxZuFQtKzQYnCw1YTGBurNUnXqLw4Gy6',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiN3czS3FLb3BYaktLMktSamRoWUtSUlFYTFBHS2tUbTROT1VCZHZXYiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NjU6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9pbWFnZXMvcHJvZmlsZS8xNzQzMzUyMzI1XzY3ZTk3MjA1NjI2Y2UuanBnIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743352326),('N5b6HyFNq74PTmZkTYrs6LmNv0pD5nl17rxmnh7a',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRXo0Q3BBSUE3TnFsY0JGUUFqbjcwSHNyU0FPZEFDMzh3WkprSE0zaCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743351557),('OJpWmM2W4be8hT0akC98Wh963UmFrYON3RnKnWGC',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoid0JBaDFrVHJpaVlJblY4VTZ3bEJkNHZDNXpTdmdEb09RaWd4UU9DciI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTQ1MTlfYl9jZjQ4MGQ4NmI4YTQwZmVjYzQyMGIxN2ViMWVmYzdlMS5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743354520),('opXOn7H6zDNBpGmn0qMXHFPoTJ3rZ9roNV4sUHi0',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoidzRQUmxyTkVtaUhCQUxkY1czRURXd2dZbEFieENqczdWN056bmxpZSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTUzNTBfYl8wMjgwM2RjN2VjYmY4OWE2ZjA2MTc0MmZkMGU1ZmZiYS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743355536),('P3OctVbbGOq0E8lYNt53sMJODH5DMCCmt9kSOxSk',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNktLVkUxaEFnS1ZIUmNGNXNvR2FROU5vNGl2cUE1WWFJYkh4SmppUCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743349897),('PTkjk6HtRnoAQsmxnHLo3kLhgAPEj0wmgfaIVytW',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiV2NidzRuVk52UDVPY2VLN0ltZVVsWG9OSFpkUEFNczVNZUdRYXRTaSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTQ1MTlfYl9jZjQ4MGQ4NmI4YTQwZmVjYzQyMGIxN2ViMWVmYzdlMS5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743355187),('qJzQP2FweTYl6xjGEKJeGNwdxDYyo3tqRjiZfHsd',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVFFRYkFDSjR6U3RUU1V5N3U3RXVYa01nZUFuaWhQeWkza3o1eDNzZiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTMzOTlfYl8wYWVkMzdkYTVmN2NiNzIzMThiYmE0MGYzN2NlMGI1Zi5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743354437),('RSeIT2PCSdCxvL8zJt3aH11XVJbE1ovQDaSwDHIg',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiOGhON3d6Tmc1RjNlOHJBUFRNbThzOE9LeG9qRE0yaEtxb0NDWGh0NCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743351320),('RvB2RIfET3YNHU4DZzVjRp1UTXDTHOmeIerfSV90',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiTURaQ0JVQnE5N0YwZW5Dd1NKM3JMWlM5NHZWUk5sMnZlbkdMY2JqUCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NjU6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9pbWFnZXMvcHJvZmlsZS8xNzQzMzUxOTkzXzY3ZTk3MGI5OTRkMGEucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743351994),('SBvy0W1QyBKQa2ZXdsCrj5emYKdYe0w1MXaQtMCD',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiYmtSR0ZoSDBjNGpTVVZpcWFmOFVPSTNBdmRSRmNzd3RTZWhHSVI5RiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743351750),('SG0PtV5Azwkp5ml3tLGyiVo0hwBsndgaSFpWEJi0',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiUUN4VU8yd1NRTE9SOTRYN2pzTkp6Z2FRdDJKNmdpYWhkZGxZQUJTZiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTQ0ODZfYl8wMjgwM2RjN2VjYmY4OWE2ZjA2MTc0MmZkMGU1ZmZiYS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743354510),('SihIP1cstAA8BA2LJeXzPUAReLGL4XcCqJtKbvQ8',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiaFZ2cWtqeUdsc2ZVRFNPVTBNRDl3SG56eVZMQVh1VUt6Wk54NzhNaCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743351659),('SqAn6iGLkGxcVc78g1GwPcuqUhTcHwEusC4PASGk',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiM1ExVnpzbXlUWDFCTU5kY0xXTnZkVTVONUswOGZnTGpubzJUWmRDMyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743349228),('T7kjYpgwJ7IcF5kApsNWu7rTHlRItBPgxIBozisD',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoidnVTYTRVVkNSeDM5VlpoaUxUbGtGWjl5QmdCclp5aWtPTnpCaFN2NSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NjU6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9pbWFnZXMvcHJvZmlsZS8xNzQzMzUyMzI1XzY3ZTk3MjA1NjI2Y2UuanBnIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743352325),('tqe3MXgbc2Guk8jonwx5kYLZkk3bxiGRnk4EBLJL',NULL,'::1','PostmanRuntime/7.43.2','YTozOntzOjY6Il90b2tlbiI7czo0MDoiSld3RWFRbTJaYnJXZVJGWVg2aUdSUVFTVmk3UTJKbFVBSUpjR2FwMCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzN0OXIyWENPdUZGZDc5SVRqdzFUajJTcVhqaTFuTk9WMFg2a0lnSlEucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743352721),('tW24XaPd0uSE9VuG3IMbHg7itlvW8pmdFXC2kWqt',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMkhqRWJtNUg0VnJRMEJJdUpDaFFpemtTekxTRFVBajFSS3hMc1luUSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743349910),('Ucq84utwRy3o5dUR8KdCDbbjFXYZyFhAdGo6Qcsf',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRENkTnJFbFREZVNMSUxTcDF0cEx0am1BNjF3MWZ0NzJYdW5lcWFYOSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743349253),('UMmEGm335wGMeftMLoUcI68V4rj4MIYbijAbFeEo',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiTnRUUU9MVFFhWDk2Z25USk5jWHlDZnBWN002NWdIaHowR3VWUEpDMyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743351420),('V37Eb1O7O4RCxt8wPqDZ6ygOsyZ0E5U1PA8rsYRf',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRjB1TTVJc0Q2dzdsc1hKT2JVRVh0bjhzek1ZWEltVTlZQ3BVRXdTdiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTUzNTBfYl8wMjgwM2RjN2VjYmY4OWE2ZjA2MTc0MmZkMGU1ZmZiYS5qcGciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743355485),('Vr6pdrsW8duJmcczoi7T1f6mIiCfSPmY34NQO0EK',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMGp4TkxvQng0d2sxSG1GbUdwNkV3MDhnVWlCUWZ0MkJ4cEVUb0dZTyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743350089),('VXfRgjvGgKVfdNdglzZbMgdSJTeA4iOShA058Cwh',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNGxDMEVDVVVLdTBLUm9XZ0hHdGFDd3F3d01vMFh3cjFDblJaQlRsQSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTMzOTlfYl8wYWVkMzdkYTVmN2NiNzIzMThiYmE0MGYzN2NlMGI1Zi5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743354353),('WhNpyJlUwhgQcPzvk6uCckB1VTzqUWAxHvg5T7Es',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoia2gxTzJ5TTVWbVByMzNTUmxXd1hTWDI3aXNvaVl0MTJxek5OSXJkVCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743351304),('WUDKv8sEucI2q5EtN9si2A4Jiz4CdygaBCfijMva',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoielBIZG13cW1xZlB5OUFaVmNad3g1a3dJVzhBN05VUU13eHJzc2JyWSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NjU6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9pbWFnZXMvcHJvZmlsZS8xNzQzMzUyMzI1XzY3ZTk3MjA1NjI2Y2UuanBnIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743352646),('wYlY1MKKaGU1kXfW3WgVeYbJTfmKrnE3CFxsKslS',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiYVZQaERZeHpVWm44U2dWbFB4NXpCWFlLTzNwVVlXMW1Xd2tRUHk0ciI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTQ1MTlfYl9jZjQ4MGQ4NmI4YTQwZmVjYzQyMGIxN2ViMWVmYzdlMS5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743354916),('XL50Mgl41r40zgLUcnUTqUcp6XnjOPMfpBa07ETQ',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiNGswbEhVMUYzc2l2MUtpSzAzOGlKTmJHZll5Q2xaV2ttbGZkY0ZkeSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6NjU6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9pbWFnZXMvcHJvZmlsZS8xNzQzMzUxOTkzXzY3ZTk3MGI5OTRkMGEucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743351993),('XnhXkU8X9LBQ10wDLUJWtY3nzIhxwohwepvTstFx',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMGVuUm5WSjBVenRsaVdFNVBTTGRnTkZDZW5HSFVwYWRGTXlrV0hmbSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTQ1MTlfYl9jZjQ4MGQ4NmI4YTQwZmVjYzQyMGIxN2ViMWVmYzdlMS5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743354968),('YJJ1cMfLb93VyJ3wfjzYK153BPuLKtCWBOGoylM8',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiZ3Z5QURtS0dWTFB0MFVLYzZON09oM1BqazdxNEhXYmlabUgydlZabCI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTQ1MTlfYl9jZjQ4MGQ4NmI4YTQwZmVjYzQyMGIxN2ViMWVmYzdlMS5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743354537),('yvVdAY8OguxA6IsDhh11V5VQLmy7mwSQucwzSg6A',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiVW9WTWo0QjZ6TUpwS3k5eHVJcnRwTUtxVkFTeFlySk0xVHdHVEVOdiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743351308),('z1Bfn3kGrFSxb8wikvq6tXpkJMN8MdQH1nZXfhYJ',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiSW1wU2Jpc0NBT1NNY1ZOaXRudllUVHVicnM1Q1RtZ1ZucE15Y0hWSSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6ODk6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzL1h1U0JZNGw4anU0aHR6dnN2ZVRjQnRVQ05kQkFSdlBDMWhWc3VZZE8ucG5nIjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==',1743349910),('ZO41R7TXBdLnKQ74usfhO4yNDeHxTcjp2wMXHSWX',NULL,'::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0','YTozOntzOjY6Il90b2tlbiI7czo0MDoiRVNQbm81MGp1aHEzSUJPbXhsRnVtUmxBWHNpMlFkbzExY0RJU1MwaiI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6OTQ6Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4OS9zdG9yYWdlL3Byb2ZpbGUtaW1hZ2VzLzE3NDMzNTMzOTlfYl8wYWVkMzdkYTVmN2NiNzIzMThiYmE0MGYzN2NlMGI1Zi5wbmciO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19',1743353399);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
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
  `google_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `purchase_status` enum('none','active','expired') DEFAULT 'none',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'John Doe','john@example.com',NULL,'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','photographer','+1234567890','https://cfr2.mionet.top/mionet-a/2025/02/25/67bcd5bb96347.webp','This is an important life moment that you must capture on it.',NULL,NULL,'2025-02-24 18:34:03','2025-03-03 16:16:20','none'),(2,'Jane Smith','jane@example.com',NULL,'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','photographer','+1987654321','https://cfr2.mionet.top/mionet-a/2025/02/25/67bcd8a1ed4c4.jpg','Specializing in creative photography that transforms ordinary locations into extraordinary settings',NULL,NULL,'2025-02-24 18:34:03','2025-03-03 18:19:23','none'),(3,'Donald Trump','trump@example.com',NULL,'$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','photographer','+1122334455','https://cfr2.mionet.top/mionet-a/2025/02/25/67bcd918c7a1a.webp','Dating profile photography specialist with a keen eye for creating authentic, appealing images that get results.',NULL,NULL,'2025-02-24 18:34:03','2025-03-03 18:42:05','none'),(4,'Brian Griffin','brian@example.com',NULL,'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','photographer','+1555666777','https://i.cbc.ca/1.2439270.1385396617!/fileImage/httpImage/image.jpg_gen/derivatives/16x9_1180/family-guy-brian-from-fox.jpg','I am very knowledgeable about pet videography, especially dogs.',NULL,NULL,'2025-02-24 18:34:03','2025-03-03 18:32:25','none'),(5,'Rick','morty@example.com',NULL,'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','photographer','+1888999000','https://hips.hearstapps.com/hmg-prod/images/rick-and-morty-season-six-image-1662104016.jpg?crop=0.411xw:0.730xh;0.450xw,0.0222xh&resize=980:*','Paranormal photography specialist with expertise in capturing the unexplained',NULL,NULL,'2025-02-24 18:34:03','2025-03-03 18:19:23','none'),(6,'Félix Lengyel','felix@example.com',NULL,'$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','customer','+1949084433','https://cfr2.mionet.top/mionet-a/2025/02/25/67bcda8f35d32.jpg','F**K',NULL,NULL,'2025-02-24 18:34:03','2025-02-24 20:46:56','none'),(7,'Xunze Tan','24247472@studentmail.ul.ie',NULL,'$2y$12$MBCVVMbxpz0FFvLu9zbPd.7rtl0Lc6bTasn0jtNJBpxyd3e7y/lQG','customer','+3530438231873','http://localhost:8089/api/images/profile_7_1743417692.png','200 OK','MPHdVpGUMIV1t1vGXuHh4a75R7pxJboHz2njEzi0ueqMWKbjXLOGkPbydwZ9',NULL,'2025-02-24 20:53:34','2025-03-31 14:45:39','none'),(8,'Emma Wilson','emma@example.com','2025-02-26 10:00:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','photographer','+4476543210','https://miro.medium.com/v2/resize:fit:1200/1*8NheDriDX-Wj1_4dqFcd3g.jpeg','Award-winning portrait photographer with 10 years experience',NULL,NULL,'2025-02-26 10:00:00','2025-02-27 20:31:47','none'),(9,'David Chen','david@example.com','2025-02-26 10:01:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','photographer','+4412345678','https://koreacrate.com/cdn/shop/articles/Exo_Chen_Marriage.jpg','Wedding and event photographer specializing in candid moments',NULL,NULL,'2025-02-26 10:01:00','2025-03-03 18:13:37','none'),(10,'Sophie Martin','sophie@example.com','2025-02-26 10:02:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','photographer','+3366778899','https://i0.wp.com/momentumleaders.org/wp-content/uploads/2023/09/Martin-Sophie-scaled-1.jpg','Fashion and editorial photographer based in Paris',NULL,NULL,'2025-02-26 10:02:00','2025-02-27 20:31:47','none'),(11,'Carlos Rodriguez','carlos@example.com','2025-02-26 10:03:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','photographer','+3412345678','https://wp-constellation-2021.s3.eu-west-2.amazonaws.com/media/2022/09/220902-Carlos-1.jpg','Travel and landscape photographer, always on the move',NULL,NULL,'2025-02-26 10:03:00','2025-02-27 20:31:47','none'),(12,'Akira Tanaka','akira@example.com','2025-02-26 10:04:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','photographer','+8112345678','https://www.morihamada.com/sites/default/files/people/images/aki-tanaka_thumb.jpg','Minimalist photographer specialising in the beauty of architecture',NULL,NULL,'2025-02-26 10:04:00','2025-03-03 17:55:51','none'),(13,'Maria Silva','maria@example.com','2025-02-26 10:05:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+5512345678','https://images.squarespace-cdn.com/content/v1/6089fc3366bb623a08f3e27a/37e15ed1-9681-4468-9dd0-3dbf4016eb71/PCH-MariaSilva-TEAM-20mb.jpg','Photography enthusiast',NULL,NULL,'2025-02-26 10:05:00','2025-02-27 20:31:47','active'),(14,'Thomas Mueller','thomas@example.com','2025-02-26 10:06:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+4923456789','https://media.cnn.com/api/v1/images/stellar/prod/180226153228-thomas-mueller-wink-thumbs-up.jpg','Looking for wedding photographers',NULL,NULL,'2025-02-26 10:06:00','2025-02-27 20:31:47','active'),(15,'Olivia Brown','olivia@example.com','2025-02-26 10:07:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+4412378945','https://oldvic.ac.uk/wp-content/uploads/2021/05/Olivia-Brown-1.jpg','Fashion model seeking portfolio photographers',NULL,NULL,'2025-02-26 10:07:00','2025-02-27 20:31:47','active'),(16,'James Wilson','james@example.com','2025-02-26 10:08:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+4423456123','https://www.cromwellhospital.com/wp-content/uploads/2024/04/Dr-James-Wilson.jpg','Business owner looking for product photography',NULL,NULL,'2025-02-26 10:08:00','2025-02-27 20:31:47','active'),(17,'Elena Petrova','elena@example.com','2025-02-26 10:09:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+7123456789','https://photos.lensculture.com/large/f6479db7-9ebf-4204-9f67-277145c37c37.jpg','Travel blogger needing destination photos',NULL,NULL,'2025-02-26 10:09:00','2025-02-27 20:31:47','active'),(18,'Ahmed Hassan','ahmed@example.com','2025-02-26 10:10:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+2012345678','https://en.etilaf.org/wp-content/uploads/2022/06/%D8%A3%D8%AD%D9%85%D8%AF-%D8%AD%D8%B3%D9%86-0.jpg','Family man looking for portrait sessions',NULL,NULL,'2025-02-26 10:10:00','2025-02-27 20:31:47','active'),(19,'Zoe Hamilton','zoe@example.com','2025-02-26 10:11:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+1234987650','https://7kbw.co.uk/wp-content/uploads/2022/08/ZOE-HAMILTON-022-1-scaled-e1663836738182.jpg','Event planner seeking photographers',NULL,NULL,'2025-02-26 10:11:00','2025-02-27 20:31:47','active'),(20,'Luis Garcia','luis@example.com','2025-02-26 10:12:00','$2y$12$a.gRK22.xSd8YGUoOPbtgOHY8JnZ06qxRjHleXIxHYriWYdrgHhke','customer','+3498765432','https://d3j2s6hdd6a7rg.cloudfront.net/v2/uploads/media/default/0001/15/thumb_14670_default_news_size_5.jpeg','Restaurant owner needing food photography',NULL,NULL,'2025-02-26 10:12:00','2025-02-27 20:31:47','active'),(21,'亭曈','wuwuhenfeng@gmail.com',NULL,'$2y$12$hm4qbMu46P4eUy.BZDVyD.I4Q.5o/cPjIMxGSFbfejT7CRQPa2G4C','customer',NULL,'https://lh3.googleusercontent.com/a/ACg8ocIkwR2FIEyFHM-xlToWFjkzReTfWRfKno4rGGxClNDY9KgfiC-k=s96-c',NULL,NULL,'101907482129670047341','2025-03-07 18:43:27','2025-03-07 18:43:27','none'),(22,'Test UserA','testuserA@arcueid.org',NULL,'$2y$12$fR8tO399tdyriYzabpwO6.SMkL0NbSCmes80wtsUsUz1b6aERffQK','customer',NULL,NULL,NULL,NULL,NULL,'2025-03-25 20:41:55','2025-03-25 20:41:55','none'),(23,'Zitao Zhang','zitao@arcueid.org',NULL,'$2y$12$FypBmnEcEwCTSsM7lzA5wuxsCPxBwQATPKTsBw/lFYgulW1SZAwgq','customer',NULL,NULL,NULL,NULL,NULL,'2025-03-26 17:37:49','2025-03-26 17:37:49','none');
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

-- Dump completed on 2025-04-02 17:46:46
