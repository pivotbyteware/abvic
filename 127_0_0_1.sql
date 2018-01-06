-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 28, 2017 at 07:37 PM
-- Server version: 10.1.28-MariaDB
-- PHP Version: 7.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `acs_loan_mgt`
--
CREATE DATABASE IF NOT EXISTS `acs_loan_mgt` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `acs_loan_mgt`;

-- --------------------------------------------------------

--
-- Table structure for table `auth_workflow`
--

CREATE TABLE `auth_workflow` (
  `id` bigint(20) NOT NULL,
  `category` varchar(100) NOT NULL,
  `auth_item_id` varchar(100) NOT NULL,
  `source_user_id` bigint(20) NOT NULL,
  `target_user_id` bigint(20) NOT NULL,
  `auth_status` varchar(100) NOT NULL COMMENT 'One of PENDING, REASSIGNED, DECLINED, AUTHORIZED',
  `auth_action_date` datetime NOT NULL,
  `auth_action_remarks` varchar(255) NOT NULL,
  `auth_token` varchar(10) NOT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `auth_workflow`
--

INSERT INTO `auth_workflow` (`id`, `category`, `auth_item_id`, `source_user_id`, `target_user_id`, `auth_status`, `auth_action_date`, `auth_action_remarks`, `auth_token`, `date`) VALUES
(28, 'NEW_LOAN_OPENING', '27', 1, 4, 'AUTHORIZED', '2017-12-28 00:03:14', '', '', '2017-12-28 00:02:21'),
(29, 'LOAN_PAYMENT', '3', 1, 2, 'AUTHORIZED', '2017-12-28 00:04:43', '', '', '2017-12-28 00:03:46'),
(30, 'LOAN_PAYMENT', '4', 1, 2, 'AUTHORIZED', '2017-12-28 00:08:24', '', '', '2017-12-28 00:08:16'),
(31, 'LOAN_PAYMENT', '5', 1, 2, 'AUTHORIZED', '2017-12-28 00:10:56', '', '', '2017-12-28 00:10:46'),
(32, 'LOAN_PAYMENT', '6', 1, 2, 'AUTHORIZED', '2017-12-28 00:12:07', '', '', '2017-12-28 00:11:44'),
(33, 'NEW_LOAN_OPENING', '28', 1, 2, 'AUTHORIZED', '2017-12-28 00:21:03', '', '', '2017-12-28 00:20:56'),
(34, 'LOAN_PAYMENT', '7', 1, 2, 'DECLINED', '2017-12-28 00:31:54', 'test', '', '2017-12-28 00:21:22'),
(35, 'LOAN_PAYMENT', '8', 1, 2, 'AUTHORIZED', '2017-12-28 00:52:23', '', '', '2017-12-28 00:52:15'),
(36, 'NEW_LOAN_OPENING', '29', 1, 2, 'AUTHORIZED', '2017-12-28 01:23:42', '', '', '2017-12-28 00:52:49'),
(37, 'LOAN_PAYMENT', '9', 1, 2, 'AUTHORIZED', '2017-12-28 01:27:39', '', '', '2017-12-28 01:27:27'),
(38, 'NEW_LOAN_OPENING', '30', 1, 2, 'DECLINED', '2017-12-28 01:39:02', 'TEsting....!', '', '2017-12-28 01:28:11'),
(39, 'NEW_LOAN_OPENING', '31', 3, 4, 'PENDING', '0000-00-00 00:00:00', '', '', '2017-12-28 01:50:55'),
(40, 'NEW_LOAN_OPENING', '32', 3, 2, 'PENDING', '0000-00-00 00:00:00', '', '', '2017-12-28 01:52:30'),
(41, 'NEW_LOAN_OPENING', '33', 3, 4, 'AUTHORIZED', '2017-12-28 11:28:21', '', '', '2017-12-28 11:25:45'),
(42, 'LOAN_PAYMENT', '10', 3, 4, 'AUTHORIZED', '2017-12-28 11:32:05', '', '', '2017-12-28 11:31:03');

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` int(11) NOT NULL,
  `branch_code` varchar(50) NOT NULL,
  `branch_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `branch_code`, `branch_name`) VALUES
(1, '001', 'Branch A'),
(2, '002', 'Branch B');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` bigint(20) NOT NULL,
  `id_type` varchar(100) NOT NULL,
  `id_number` varchar(100) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `email1` varchar(100) NOT NULL,
  `email2` varchar(100) NOT NULL,
  `email3` varchar(100) NOT NULL,
  `mobile1` varchar(50) NOT NULL,
  `mobile2` varchar(50) NOT NULL,
  `mobile3` varchar(50) NOT NULL,
  `phone1` varchar(50) NOT NULL,
  `phone2` varchar(50) NOT NULL,
  `phone3` varchar(50) NOT NULL,
  `address_line1` varchar(255) NOT NULL,
  `address_line2` varchar(255) NOT NULL,
  `address_line3` varchar(255) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `id_type`, `id_number`, `first_name`, `middle_name`, `last_name`, `company_name`, `email1`, `email2`, `email3`, `mobile1`, `mobile2`, `mobile3`, `phone1`, `phone2`, `phone3`, `address_line1`, `address_line2`, `address_line3`, `branch_id`, `created_by`, `created_at`, `status`) VALUES
(33, 'NATIONAL_ID', '268398241', 'Manel', '', 'Somili', 'PivotByteWare Solutions', 'lucky@pivotbyteware.com', '', '', '0963686873', '', '', '', '', '', 'Lusaka, Zambia', '', '', 1, 1, '2017-12-27 13:58:15', ''),
(34, 'PASSPORT', '2683982410003', 'Makonde', '', 'Mwale', 'PivotByteWare', '', '', '', '0963686873', '', '', '', '', '', 'Lusaka, Zambia', '', '', 1, 3, '2017-12-28 01:50:22', ''),
(35, 'DRIVERS_LICENSE', '268398241', 'Joel', '', 'Chilala', 'AB Bank Zambia', '', '', '', '0963686873', '', '', '', '', '', 'Kamwala Southe, Lusaka, Zambia', '', '', 1, 3, '2017-12-28 01:52:02', ''),
(36, 'NATIONAL_ID', '987688111', 'Makonde', '', 'Mwale', 'PivotByteWare', '', '', '', '0963686873', '', '', '', '', '', 'Lusaka, Zambia', '', '', 1, 3, '2017-12-28 11:23:52', '');

-- --------------------------------------------------------

--
-- Table structure for table `customer_documents`
--

CREATE TABLE `customer_documents` (
  `id` bigint(20) NOT NULL,
  `customer_id` bigint(20) NOT NULL,
  `document_code` varchar(160) NOT NULL,
  `document_file_name` varchar(255) NOT NULL,
  `document_file_extension` varchar(20) NOT NULL,
  `document_mime_type` varchar(100) NOT NULL,
  `document_file_size` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customer_documents`
--

INSERT INTO `customer_documents` (`id`, `customer_id`, `document_code`, `document_file_name`, `document_file_extension`, `document_mime_type`, `document_file_size`) VALUES
(77, 33, 'NATIONAL_ID', '7384d2c8d1665d5c1ab3e581aa9f6c9d.docx', '.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 11272),
(78, 33, 'PASSPORT_PHOTO', 'b35ab799f900147e291dcf02d9ce8ec0.txt', '.txt', 'text/plain', 180019),
(79, 33, 'BANK_ACCOUNT', 'cc3ee2698b652f5492c001ffb0b9b5c0.odt', '.odt', 'application/vnd.oasis.opendocument.text', 11541),
(80, 33, 'SIGNATURE', '0016a39bec192244b8df5daf85b625ef.odt', '.odt', 'application/vnd.oasis.opendocument.text', 8670),
(81, 34, 'NATIONAL_ID', '759a4e13125c2379d6abf02a4f6ee631.docx', '.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 11272),
(82, 34, 'PASSPORT_PHOTO', 'ab74ad8b6749522311e4bc2176b7d75a.odt', '.odt', 'application/vnd.oasis.opendocument.text', 8670),
(83, 34, 'BANK_ACCOUNT', 'afa22674835d882d113e336c7cbabfc7.txt', '.txt', 'text/plain', 180019),
(84, 34, 'SIGNATURE', '6281a4d610bf290efb254b753f6f1c1f.odt', '.odt', 'application/vnd.oasis.opendocument.text', 11541),
(85, 35, 'NATIONAL_ID', 'dc0956fd2242f159c751795a55232fd0.docx', '.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 11272),
(86, 35, 'PASSPORT_PHOTO', 'c7a2c478302c39aa6eae7e393580367e.txt', '.txt', 'text/plain', 180019),
(87, 35, 'BANK_ACCOUNT', '346d540b1a4da0865a512eb678a8e0ad.odt', '.odt', 'application/vnd.oasis.opendocument.text', 11541),
(88, 35, 'SIGNATURE', '0fdd3157cb68b34172a587815eacbe80.odt', '.odt', 'application/vnd.oasis.opendocument.text', 8670),
(89, 36, 'NATIONAL_ID', '86ec861e8850f029bb040dc632eb5d31.docx', '.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 11272),
(90, 36, 'PASSPORT_PHOTO', '6eb6e29bdd5f8e77b9ad83b4ada21ef8.txt', '.txt', 'text/plain', 180019),
(91, 36, 'BANK_ACCOUNT', '2f8fdf1da070a301bcff49d041cf6339.odt', '.odt', 'application/vnd.oasis.opendocument.text', 11541),
(92, 36, 'SIGNATURE', '4b0c05e06e3271db6d0c68a8f65c658c.odt', '.odt', 'application/vnd.oasis.opendocument.text', 8670);

-- --------------------------------------------------------

--
-- Table structure for table `customer_document_requirements`
--

CREATE TABLE `customer_document_requirements` (
  `id` int(11) NOT NULL,
  `document_code` varchar(160) NOT NULL,
  `document_name` varchar(160) NOT NULL,
  `is_required` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customer_document_requirements`
--

INSERT INTO `customer_document_requirements` (`id`, `document_code`, `document_name`, `is_required`) VALUES
(1, 'NATIONAL_ID', 'National ID', 1),
(2, 'PASSPORT_PHOTO', 'Passport Sized Photo', 1),
(3, 'BANK_ACCOUNT', 'Bank Account Number', 1),
(4, 'SIGNATURE', 'Customer Signature', 1);

-- --------------------------------------------------------

--
-- Table structure for table `customer_loans`
--

CREATE TABLE `customer_loans` (
  `id` bigint(20) NOT NULL,
  `loan_reference_number` varchar(100) NOT NULL,
  `loan_type` varchar(100) NOT NULL COMMENT 'One of MONTHLY, INSTALLMENT',
  `customer_id` varchar(100) NOT NULL,
  `customer_bank_account_number` varchar(100) NOT NULL,
  `customer_bank_account_sort_code` varchar(100) NOT NULL,
  `opening_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `opening_user_id` bigint(20) NOT NULL,
  `loan_status` varchar(100) NOT NULL COMMENT 'One of ''PENDING_AUTH'', ''DECLINED'', ''OPEN'' or ''CLOSED''',
  `branch_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customer_loans`
--

INSERT INTO `customer_loans` (`id`, `loan_reference_number`, `loan_type`, `customer_id`, `customer_bank_account_number`, `customer_bank_account_sort_code`, `opening_date`, `opening_user_id`, `loan_status`, `branch_id`) VALUES
(27, '6747ae69-15cd-5b73-a1c5-cdc0449996ab', 'MONTHLY', '33', '10000100001', '1003', '2017-12-28 00:02:21', 1, 'CLOSED', 1),
(28, '4d33e743-a7f6-5a21-8a5b-6074cd4622ec', 'MONTHLY', '33', '100001000010', '30001', '2017-12-28 00:20:55', 1, 'CLOSED', 1),
(29, '4122e09f-6467-5dbd-ba01-c8218c6d5992', 'MONTHLY', '33', '100030001', '5006', '2017-12-28 00:52:49', 1, 'CLOSED', 1),
(30, '18f3a0e4-47b3-5e77-af40-50d1c1d0e5ee', 'MONTHLY', '33', '10000100001', '5002', '2017-12-28 01:28:11', 1, 'DECLINED', 1),
(31, '96ae3657-0f04-55e1-996c-191cb7ff9f0c', 'MONTHLY', '34', '500060005', '60001', '2017-12-28 01:50:55', 3, 'PENDING_AUTH', 1),
(32, '05c6b7d0-2bd9-5c73-bd49-435d78bc2430', 'MONTHLY', '35', '100010001', '5004', '2017-12-28 01:52:30', 3, 'PENDING_AUTH', 1),
(33, '6aba4fdf-5e35-50d8-8baa-d592c0d74029', 'MONTHLY', '36', '100012222', '1001', '2017-12-28 11:25:45', 3, 'OPEN', 1);

-- --------------------------------------------------------

--
-- Table structure for table `customer_loan_investments`
--

CREATE TABLE `customer_loan_investments` (
  `id` bigint(20) NOT NULL,
  `customer_id` bigint(20) NOT NULL,
  `loan_id` bigint(20) NOT NULL,
  `investment_reference_number` varchar(100) NOT NULL,
  `investment_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `investment_amount` double NOT NULL,
  `interest_rate` double NOT NULL,
  `interest_amount` double NOT NULL,
  `total_amount` double NOT NULL,
  `interest_maturity_date` date NOT NULL,
  `investment_duration` int(11) NOT NULL,
  `repayment_date` date NOT NULL,
  `is_opening_investment` char(1) NOT NULL COMMENT 'One of ''Y'', ''N''',
  `is_closing_investment` char(1) NOT NULL COMMENT 'One of ''Y'', ''N''',
  `investment_status` varchar(100) NOT NULL DEFAULT 'ACTIVE',
  `payment_status` varchar(100) NOT NULL COMMENT 'One of OPEN, PAID',
  `payment_date` datetime NOT NULL,
  `payment_mode` varchar(100) NOT NULL COMMENT 'One of ''DDACC'', ''CASH''',
  `payment_amount` double NOT NULL,
  `payment_user_id` bigint(20) NOT NULL,
  `is_full_payment` char(1) NOT NULL COMMENT 'One of ''Y'', ''N''',
  `payment_reference_number` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customer_loan_investments`
--

INSERT INTO `customer_loan_investments` (`id`, `customer_id`, `loan_id`, `investment_reference_number`, `investment_date`, `investment_amount`, `interest_rate`, `interest_amount`, `total_amount`, `interest_maturity_date`, `investment_duration`, `repayment_date`, `is_opening_investment`, `is_closing_investment`, `investment_status`, `payment_status`, `payment_date`, `payment_mode`, `payment_amount`, `payment_user_id`, `is_full_payment`, `payment_reference_number`) VALUES
(26, 33, 27, '317d867a-16e3-5640-bf9f-5dfbbc008009', '2017-12-28 00:02:21', 10000, 30, 3000, 13000, '2017-12-28', 5, '2018-01-01', 'Y', 'N', 'PROCESSED', 'PAID', '2017-12-28 00:03:46', 'CASH', 2000, 1, 'N', ''),
(27, 33, 27, '4b3062f7-88e5-5529-ba89-13eacfb12bbe', '2017-12-28 00:04:43', 11000, 30, 3300, 14300, '2018-01-02', 1, '2018-05-28', 'N', 'N', 'PROCESSED', 'PAID', '2017-12-28 00:08:16', 'CASH', 3000, 1, 'N', ''),
(28, 33, 27, '73952f36-2edb-5e79-8b31-a138eead0ccb', '2017-12-28 00:08:24', 11300, 30, 3390, 14690, '2018-01-02', 1, '2018-01-28', 'N', 'N', 'PROCESSED', 'PAID', '2017-12-28 00:10:46', 'CASH', 14000, 1, 'N', ''),
(29, 33, 27, '61e24f83-418e-5c86-ae9c-c3f68860acfb', '2017-12-28 00:10:56', 690, 30, 207, 897, '2018-01-02', 1, '2018-01-28', 'N', 'Y', 'PROCESSED', 'PAID', '2017-12-28 00:11:44', 'DDACC', 897, 1, 'Y', ''),
(30, 33, 28, '9ad208ba-06b6-5fdc-8ef4-e2d129f74122', '2017-12-28 00:20:56', 400000, 30, 120000, 520000, '2017-12-28', 2, '2017-12-31', 'Y', 'Y', 'PROCESSED', 'PAID', '2017-12-28 00:52:15', 'CASH', 520000, 1, 'Y', ''),
(31, 33, 29, '92030237-d54a-5152-9f87-5f6f8ef53b54', '2017-12-28 00:52:49', 400, 30, 120, 520, '2017-12-28', 3, '2017-12-31', 'Y', 'Y', 'PROCESSED', 'PAID', '2017-12-28 01:27:27', 'CASH', 520, 1, 'Y', ''),
(32, 33, 30, '988f050d-e658-5082-b9a1-eb61a1bedd7c', '2017-12-28 01:28:11', 100, 30, 30, 130, '2017-12-28', 1, '2017-12-31', 'Y', 'N', 'ACTIVE', 'OPEN', '0000-00-00 00:00:00', '', 0, 0, '', ''),
(33, 34, 31, 'e120d9c3-0f71-5750-9ed2-8d616d1c5762', '2017-12-28 01:50:55', 45000, 30, 13500, 58500, '2017-12-28', 10, '2017-12-31', 'Y', 'N', 'ACTIVE', 'OPEN', '0000-00-00 00:00:00', '', 0, 0, '', ''),
(34, 35, 32, '63178a41-6bd7-5dba-ad24-0c3fc25ce5ef', '2017-12-28 01:52:30', 1000, 30, 300, 1300, '2017-12-28', 2, '2018-02-01', 'Y', 'N', 'ACTIVE', 'OPEN', '0000-00-00 00:00:00', '', 0, 0, '', ''),
(35, 36, 33, '8d80b9a2-e83d-5201-892e-942a41b8f778', '2017-12-28 11:25:45', 3000, 30, 900, 3900, '2017-12-28', 1, '2018-01-01', 'Y', 'N', 'PROCESSED', 'PAID', '2017-12-28 11:31:03', 'CASH', 1000, 3, 'N', ''),
(36, 36, 33, 'dc879084-f875-5856-89c0-f577303d2a3f', '2017-12-28 11:32:05', 2900, 30, 870, 3770, '2018-01-02', 1, '2018-01-28', 'N', 'N', 'ACTIVE', 'OPEN', '0000-00-00 00:00:00', '', 0, 0, '', '');

-- --------------------------------------------------------

--
-- Table structure for table `customer_loan_payments_activity`
--

CREATE TABLE `customer_loan_payments_activity` (
  `id` bigint(20) NOT NULL,
  `payment_reference_number` varchar(100) NOT NULL,
  `investment_id` bigint(20) NOT NULL,
  `status` varchar(100) NOT NULL,
  `payment_initiation_date` datetime NOT NULL,
  `payment_mode` varchar(100) NOT NULL,
  `payment_amount` double NOT NULL,
  `payment_initiator_user_id` bigint(20) NOT NULL,
  `payment_auth_user_id` bigint(20) NOT NULL,
  `payment_auth_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `customer_loan_payments_activity`
--

INSERT INTO `customer_loan_payments_activity` (`id`, `payment_reference_number`, `investment_id`, `status`, `payment_initiation_date`, `payment_mode`, `payment_amount`, `payment_initiator_user_id`, `payment_auth_user_id`, `payment_auth_date`) VALUES
(3, '', 26, 'AUTHORIZED', '2017-12-28 00:03:46', 'CASH', 2000, 1, 0, '2017-12-28 00:04:43'),
(4, '', 27, 'AUTHORIZED', '2017-12-28 00:08:16', 'CASH', 3000, 1, 0, '2017-12-28 00:08:24'),
(5, '', 28, 'AUTHORIZED', '2017-12-28 00:10:46', 'CASH', 14000, 1, 0, '2017-12-28 00:10:56'),
(6, '', 29, 'AUTHORIZED', '2017-12-28 00:11:44', 'DDACC', 897, 1, 0, '2017-12-28 00:12:07'),
(7, '', 30, 'DECLINED', '2017-12-28 00:21:22', 'CASH', 500000, 1, 0, '2017-12-28 00:31:55'),
(8, '', 30, 'AUTHORIZED', '2017-12-28 00:52:15', 'CASH', 520000, 1, 0, '2017-12-28 00:52:23'),
(9, '', 31, 'AUTHORIZED', '2017-12-28 01:27:27', 'CASH', 520, 1, 0, '2017-12-28 01:27:39'),
(10, '', 35, 'AUTHORIZED', '2017-12-28 11:31:03', 'CASH', 1000, 3, 0, '2017-12-28 11:32:05');

-- --------------------------------------------------------

--
-- Table structure for table `system_globals`
--

CREATE TABLE `system_globals` (
  `code` varchar(100) NOT NULL,
  `value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `system_globals`
--

INSERT INTO `system_globals` (`code`, `value`) VALUES
('DEFAULT_INTEREST_RATE', '30'),
('DEFAULT_REINVESTMENT_INTEREST_MATURITY_DAYS', '5'),
('DEFAULT_REINVESTMENT_MONTHS_COUNTS', '1');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `branch_id` int(11) NOT NULL,
  `first_name` varchar(160) NOT NULL,
  `last_name` varchar(160) NOT NULL,
  `screen_name` varchar(160) NOT NULL,
  `login_id` varchar(100) NOT NULL,
  `login_password` varchar(100) NOT NULL,
  `user_role` varchar(100) NOT NULL COMMENT 'One of BRANCH_TELLER, BRANCH_SUPERVISOR, SYSTEM_ADMIN',
  `status` varchar(50) NOT NULL,
  `changed_one_time_password` tinyint(4) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `branch_id`, `first_name`, `last_name`, `screen_name`, `login_id`, `login_password`, `user_role`, `status`, `changed_one_time_password`, `created_at`, `created_by`) VALUES
(1, 0, 'Lucky', 'Somili', 'Lucky Somili', 'sysuser', '$2a$10$yYs7F5h94eXb5n28tok7Y.ejr0bW49nWfXY2TioQ7j.gaLLRupz2O', 'SYSTEM_ADMIN', 'ACTIVE', 0, '2017-12-28 19:36:24', 0),
(2, 1, 'Makonde', 'Mwale', 'Makonde Mwale', 'authuser1', '$2a$10$yYs7F5h94eXb5n28tok7Y.ejr0bW49nWfXY2TioQ7j.gaLLRupz2O', 'BRANCH_SUPERVISOR', 'ACTIVE', 0, '2017-12-28 19:36:24', 0),
(3, 1, 'Abvic', 'Teller', 'Abvic Teller\r\n', 'telleruser1', '$2a$10$yYs7F5h94eXb5n28tok7Y.ejr0bW49nWfXY2TioQ7j.gaLLRupz2O', 'BRANCH_TELLER', 'ACTIVE', 0, '2017-12-28 19:36:24', 0),
(4, 1, 'Deep', 'Mwale', 'Deep Mwale', 'authuser2', '$2a$10$yYs7F5h94eXb5n28tok7Y.ejr0bW49nWfXY2TioQ7j.gaLLRupz2O', 'BRANCH_SUPERVISOR', 'ACTIVE', 0, '2017-12-28 19:36:24', 0),
(7, 1, 'Test', 'User', 'Test User', 'test1', '$2a$10$xkn1MPR5OTuIYmlLNodCrewkQSj7KX3Hu84f/LWXimtxlVQC58gS2', 'BRANCH_TELLER', 'ACTIVE', 1, '2017-12-28 18:09:04', 1),
(8, 0, 'System', 'Admin', 'System Admin', 'sysuser2', '$2a$10$h.HVh.ADIdcYN7uPC.OPFONOQL6qc5kGSBDRlw9kOP2bvo2LYbCpy', 'SYSTEM_ADMIN', 'DELETED', 1, '2017-12-28 18:32:25', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auth_workflow`
--
ALTER TABLE `auth_workflow`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer_documents`
--
ALTER TABLE `customer_documents`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer_document_requirements`
--
ALTER TABLE `customer_document_requirements`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer_loans`
--
ALTER TABLE `customer_loans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `loan_reference_number` (`loan_reference_number`);

--
-- Indexes for table `customer_loan_investments`
--
ALTER TABLE `customer_loan_investments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customer_loan_payments_activity`
--
ALTER TABLE `customer_loan_payments_activity`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `system_globals`
--
ALTER TABLE `system_globals`
  ADD PRIMARY KEY (`code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth_workflow`
--
ALTER TABLE `auth_workflow`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `customer_documents`
--
ALTER TABLE `customer_documents`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=93;

--
-- AUTO_INCREMENT for table `customer_document_requirements`
--
ALTER TABLE `customer_document_requirements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `customer_loans`
--
ALTER TABLE `customer_loans`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `customer_loan_investments`
--
ALTER TABLE `customer_loan_investments`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `customer_loan_payments_activity`
--
ALTER TABLE `customer_loan_payments_activity`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
