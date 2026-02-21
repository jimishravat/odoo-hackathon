-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 21, 2026 at 10:16 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fleetflow`
--

-- --------------------------------------------------------

--
-- Table structure for table `cargo`
--

CREATE TABLE `cargo` (
  `cargo_id` int(11) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `weight_kg` decimal(10,2) NOT NULL,
  `status` enum('PENDING','ASSIGNED','DELIVERED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `user_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cargo`
--

INSERT INTO `cargo` (`cargo_id`, `description`, `weight_kg`, `status`, `created_at`, `user_id`, `driver_id`) VALUES
(1, 'Electronics Shipment - Ahmedabad to Surat', 600.00, 'ASSIGNED', '2026-02-21 06:12:44', 2, 1),
(2, 'Pharmaceutical Supplies', 300.00, 'PENDING', '2026-02-21 06:12:44', 2, 2),
(3, 'Furniture Delivery', 1200.00, 'ASSIGNED', '2026-02-21 06:12:44', 2, 3),
(4, 'E-commerce Parcels Batch A', 200.00, 'PENDING', '2026-02-21 06:12:44', 2, 4),
(5, 'Industrial Spare Parts', 5000.00, 'ASSIGNED', '2026-02-21 06:12:44', 2, 5),
(6, 'Grocery Distribution Load', 700.00, 'PENDING', '2026-02-21 06:12:44', 2, 6);

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `driver_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `license_number` varchar(100) NOT NULL,
  `license_category` enum('TRUCK','VAN','BIKE') NOT NULL,
  `license_expiry` date NOT NULL,
  `status` enum('ON_DUTY','OFF_DUTY','SUSPENDED') DEFAULT 'ON_DUTY',
  `safety_score` decimal(5,2) DEFAULT 100.00,
  `total_trips` int(11) DEFAULT 0,
  `completed_trips` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`driver_id`, `name`, `phone`, `license_number`, `license_category`, `license_expiry`, `status`, `safety_score`, `total_trips`, `completed_trips`, `created_at`) VALUES
(1, 'Ramesh Kumar', '9876543210', 'DL-TR-001', 'TRUCK', '2028-05-10', 'ON_DUTY', 95.50, 50, 48, '2026-02-21 06:12:44'),
(2, 'Suresh Yadav', '9876543211', 'DL-TR-002', 'TRUCK', '2026-12-15', 'OFF_DUTY', 92.00, 40, 38, '2026-02-21 06:12:44'),
(3, 'Arjun Patel', '9876543212', 'DL-VN-003', 'VAN', '2027-08-20', 'ON_DUTY', 97.20, 60, 59, '2026-02-21 06:12:44'),
(4, 'Imran Shaikh', '9876543213', 'DL-VN-004', 'VAN', '2025-04-01', 'SUSPENDED', 80.00, 25, 20, '2026-02-21 06:12:44'),
(5, 'Rohit Singh', '9876543214', 'DL-BK-005', 'BIKE', '2029-01-01', 'ON_DUTY', 98.00, 70, 69, '2026-02-21 06:12:44'),
(6, 'Deepak Verma', '9876543215', 'DL-VN-006', 'VAN', '2027-11-11', 'ON_DUTY', 93.00, 35, 33, '2026-02-21 06:12:44'),
(7, 'Aman Gupta', '9876543216', 'DL-TR-007', 'TRUCK', '2026-06-30', 'ON_DUTY', 91.00, 45, 42, '2026-02-21 06:12:44');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `expense_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `trip_id` int(11) DEFAULT NULL,
  `expense_type` enum('FUEL','MAINTENANCE','OTHER') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `expense_date` date NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`expense_id`, `vehicle_id`, `trip_id`, `expense_type`, `amount`, `expense_date`, `notes`, `created_at`) VALUES
(1, 1, 3, 'MAINTENANCE', 2500.00, '2026-02-15', 'Oil Change', '2026-02-21 06:12:45'),
(2, 4, NULL, 'MAINTENANCE', 15000.00, '2026-02-10', 'Engine Repair', '2026-02-21 06:12:45'),
(3, 2, 1, 'FUEL', 7200.00, '2026-02-20', 'Trip Fuel Cost', '2026-02-21 06:12:45'),
(4, 5, 4, 'FUEL', 3600.00, '2026-02-19', 'Delivery Fuel', '2026-02-21 06:12:45'),
(5, 3, NULL, 'OTHER', 2000.00, '2026-02-17', 'Toll Charges', '2026-02-21 06:12:45'),
(6, 7, 5, 'FUEL', 900.00, '2026-02-20', 'Bike Fuel', '2026-02-21 06:12:45');

-- --------------------------------------------------------

--
-- Table structure for table `fuel_logs`
--

CREATE TABLE `fuel_logs` (
  `fuel_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `trip_id` int(11) DEFAULT NULL,
  `liters` decimal(10,2) NOT NULL,
  `cost` decimal(12,2) NOT NULL,
  `fuel_date` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fuel_logs`
--

INSERT INTO `fuel_logs` (`fuel_id`, `vehicle_id`, `trip_id`, `liters`, `cost`, `fuel_date`, `created_at`) VALUES
(1, 2, 1, 80.00, 7200.00, '2026-02-20', '2026-02-21 06:12:45'),
(2, 1, 3, 120.00, 10800.00, '2026-02-18', '2026-02-21 06:12:45'),
(3, 5, 4, 40.00, 3600.00, '2026-02-19', '2026-02-21 06:12:45'),
(4, 7, 5, 10.00, 900.00, '2026-02-20', '2026-02-21 06:12:45'),
(5, 3, NULL, 25.00, 2250.00, '2026-02-21', '2026-02-21 06:12:45');

-- --------------------------------------------------------

--
-- Table structure for table `maintenance_logs`
--

CREATE TABLE `maintenance_logs` (
  `maintenance_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `service_type` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `cost` decimal(12,2) NOT NULL,
  `service_date` date NOT NULL,
  `status` enum('SCHEDULED','IN_PROGRESS','COMPLETED') DEFAULT 'COMPLETED',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `maintenance_logs`
--

INSERT INTO `maintenance_logs` (`maintenance_id`, `vehicle_id`, `service_type`, `description`, `cost`, `service_date`, `status`, `created_at`) VALUES
(1, 4, 'Engine Repair', 'Engine overheating issue fixed', 15000.00, '2026-02-10', 'COMPLETED', '2026-02-21 06:12:44'),
(2, 1, 'Oil Change', 'Routine engine oil replacement', 2500.00, '2026-02-15', 'COMPLETED', '2026-02-21 06:12:44'),
(3, 5, 'Brake Service', 'Brake pad replacement', 4000.00, '2026-02-18', 'COMPLETED', '2026-02-21 06:12:44');

--
-- Triggers `maintenance_logs`
--
DELIMITER $$
CREATE TRIGGER `trg_vehicle_in_shop` AFTER INSERT ON `maintenance_logs` FOR EACH ROW BEGIN
    UPDATE vehicles
    SET status = 'IN_SHOP'
    WHERE vehicle_id = NEW.vehicle_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`) VALUES
(4, 'ANALYST'),
(2, 'DISPATCHER'),
(1, 'MANAGER'),
(3, 'SAFETY_OFFICER');

-- --------------------------------------------------------

--
-- Table structure for table `trips`
--

CREATE TABLE `trips` (
  `trip_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `cargo_id` int(11) DEFAULT NULL,
  `cargo_weight_kg` decimal(10,2) NOT NULL,
  `origin` varchar(255) NOT NULL,
  `destination` varchar(255) NOT NULL,
  `trip_status` enum('DRAFT','DISPATCHED','COMPLETED','CANCELLED') DEFAULT 'DRAFT',
  `start_odometer` decimal(12,2) DEFAULT NULL,
  `end_odometer` decimal(12,2) DEFAULT NULL,
  `revenue` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trips`
--

INSERT INTO `trips` (`trip_id`, `vehicle_id`, `driver_id`, `cargo_id`, `cargo_weight_kg`, `origin`, `destination`, `trip_status`, `start_odometer`, `end_odometer`, `revenue`, `created_at`, `completed_at`) VALUES
(1, 2, 1, 1, 600.00, 'Ahmedabad', 'Surat', 'DISPATCHED', 92000.00, NULL, 15000.00, '2026-02-21 06:12:44', NULL),
(2, 3, 3, 2, 300.00, 'Ahmedabad', 'Vadodara', 'DRAFT', 42000.00, NULL, 8000.00, '2026-02-21 06:12:44', NULL),
(3, 1, 7, 3, 1200.00, 'Rajkot', 'Ahmedabad', 'COMPLETED', 83000.00, 85000.00, 20000.00, '2026-02-21 06:12:44', '2026-02-21 06:12:44'),
(4, 5, 6, 4, 200.00, 'Ahmedabad', 'Gandhinagar', 'COMPLETED', 29000.00, 30000.00, 5000.00, '2026-02-21 06:12:44', '2026-02-21 06:12:44'),
(5, 7, 5, 5, 90.00, 'Surat', 'Navsari', 'DISPATCHED', 17500.00, NULL, 3000.00, '2026-02-21 06:12:44', NULL),
(6, 3, 3, 6, 700.00, 'Ahmedabad', 'Bhavnagar', 'CANCELLED', 42000.00, NULL, 0.00, '2026-02-21 06:12:44', NULL);

--
-- Triggers `trips`
--
DELIMITER $$
CREATE TRIGGER `trg_check_vehicle_capacity` BEFORE INSERT ON `trips` FOR EACH ROW BEGIN
    DECLARE max_cap DECIMAL(10,2);

    SELECT max_capacity_kg INTO max_cap
    FROM vehicles
    WHERE vehicle_id = NEW.vehicle_id;

    IF NEW.cargo_weight_kg > max_cap THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Cargo weight exceeds vehicle maximum capacity';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_trip_completed` AFTER UPDATE ON `trips` FOR EACH ROW BEGIN
    IF NEW.trip_status = 'COMPLETED' THEN
        UPDATE vehicles 
        SET status = 'AVAILABLE',
            odometer_km = NEW.end_odometer
        WHERE vehicle_id = NEW.vehicle_id;

        UPDATE drivers 
        SET status = 'ON_DUTY',
            completed_trips = completed_trips + 1,
            total_trips = total_trips + 1
        WHERE driver_id = NEW.driver_id;
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_trip_dispatched` AFTER UPDATE ON `trips` FOR EACH ROW BEGIN
    IF NEW.trip_status = 'DISPATCHED' THEN
        UPDATE vehicles 
        SET status = 'ON_TRIP' 
        WHERE vehicle_id = NEW.vehicle_id;

        UPDATE drivers 
        SET status = 'OFF_DUTY' 
        WHERE driver_id = NEW.driver_id;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password_hash`, `role_id`, `created_at`) VALUES
(1, 'Amit Sharma', 'manager@fleetflow.com', 'hashed_password_1', 1, '2026-02-21 06:12:44'),
(2, 'Riya Patel', 'dispatcher@fleetflow.com', 'hashed_password_2', 2, '2026-02-21 06:12:44'),
(3, 'Karan Mehta', 'safety@fleetflow.com', 'hashed_password_3', 3, '2026-02-21 06:12:44'),
(4, 'Neha Singh', 'analyst@fleetflow.com', 'hashed_password_4', 4, '2026-02-21 06:12:44'),
(5, 'Vikram Joshi', 'dispatcher2@fleetflow.com', 'hashed_password_5', 2, '2026-02-21 06:12:44'),
(6, 'Priya Desai', 'manager2@fleetflow.com', 'hashed_password_6', 1, '2026-02-21 06:12:44');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `vehicle_id` int(11) NOT NULL,
  `vehicle_name` varchar(100) NOT NULL,
  `model` varchar(100) DEFAULT NULL,
  `license_plate` varchar(50) NOT NULL,
  `vehicle_type` enum('TRUCK','VAN','BIKE') NOT NULL,
  `max_capacity_kg` decimal(10,2) NOT NULL,
  `odometer_km` decimal(12,2) DEFAULT 0.00,
  `status` enum('AVAILABLE','ON_TRIP','IN_SHOP','RETIRED') DEFAULT 'AVAILABLE',
  `acquisition_cost` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`vehicle_id`, `vehicle_name`, `model`, `license_plate`, `vehicle_type`, `max_capacity_kg`, `odometer_km`, `status`, `acquisition_cost`, `created_at`) VALUES
(1, 'Truck-01', 'Tata LPT 1615', 'GJ01TR1001', 'TRUCK', 10000.00, 85000.00, 'IN_SHOP', 2500000.00, '2026-02-21 06:12:44'),
(2, 'Truck-02', 'Ashok Leyland 1616', 'GJ01TR1002', 'TRUCK', 12000.00, 92000.00, 'ON_TRIP', 2700000.00, '2026-02-21 06:12:44'),
(3, 'Van-01', 'Tata Ace Gold', 'GJ01VN2001', 'VAN', 750.00, 42000.00, 'AVAILABLE', 600000.00, '2026-02-21 06:12:44'),
(4, 'Van-02', 'Mahindra Supro', 'GJ01VN2002', 'VAN', 900.00, 51000.00, 'IN_SHOP', 650000.00, '2026-02-21 06:12:44'),
(5, 'Van-03', 'Tata Ace EV', 'GJ01VN2003', 'VAN', 800.00, 30000.00, 'IN_SHOP', 800000.00, '2026-02-21 06:12:44'),
(6, 'Bike-01', 'Hero Splendor Cargo', 'GJ01BK3001', 'BIKE', 120.00, 15000.00, 'AVAILABLE', 90000.00, '2026-02-21 06:12:44'),
(7, 'Bike-02', 'TVS XL Cargo', 'GJ01BK3002', 'BIKE', 100.00, 18000.00, 'ON_TRIP', 85000.00, '2026-02-21 06:12:44'),
(8, 'Truck-03', 'Eicher Pro 3015', 'GJ01TR1003', 'TRUCK', 14000.00, 110000.00, 'RETIRED', 3000000.00, '2026-02-21 06:12:44');

-- --------------------------------------------------------

--
-- Stand-in structure for view `vehicle_operational_cost`
-- (See below for the actual view)
--
CREATE TABLE `vehicle_operational_cost` (
`vehicle_id` int(11)
,`vehicle_name` varchar(100)
,`total_operational_cost` decimal(34,2)
);

-- --------------------------------------------------------

--
-- Structure for view `vehicle_operational_cost`
--
DROP TABLE IF EXISTS `vehicle_operational_cost`;

CREATE ALGORITHM=UNDEFINED DEFINER=`` SQL SECURITY DEFINER VIEW `vehicle_operational_cost`  AS SELECT `v`.`vehicle_id` AS `vehicle_id`, `v`.`vehicle_name` AS `vehicle_name`, coalesce(sum(`e`.`amount`),0) AS `total_operational_cost` FROM (`vehicles` `v` left join `expenses` `e` on(`v`.`vehicle_id` = `e`.`vehicle_id`)) GROUP BY `v`.`vehicle_id`, `v`.`vehicle_name` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cargo`
--
ALTER TABLE `cargo`
  ADD PRIMARY KEY (`cargo_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `driver_id` (`driver_id`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`driver_id`),
  ADD UNIQUE KEY `license_number` (`license_number`),
  ADD KEY `idx_driver_status` (`status`),
  ADD KEY `idx_license_expiry` (`license_expiry`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`expense_id`),
  ADD KEY `fk_expense_trip` (`trip_id`),
  ADD KEY `idx_expense_vehicle` (`vehicle_id`);

--
-- Indexes for table `fuel_logs`
--
ALTER TABLE `fuel_logs`
  ADD PRIMARY KEY (`fuel_id`),
  ADD KEY `fk_fuel_trip` (`trip_id`),
  ADD KEY `idx_fuel_vehicle` (`vehicle_id`);

--
-- Indexes for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  ADD PRIMARY KEY (`maintenance_id`),
  ADD KEY `idx_maintenance_vehicle` (`vehicle_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `trips`
--
ALTER TABLE `trips`
  ADD PRIMARY KEY (`trip_id`),
  ADD KEY `fk_trip_cargo` (`cargo_id`),
  ADD KEY `idx_trip_status` (`trip_status`),
  ADD KEY `idx_trip_vehicle` (`vehicle_id`),
  ADD KEY `idx_trip_driver` (`driver_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`vehicle_id`),
  ADD UNIQUE KEY `license_plate` (`license_plate`),
  ADD KEY `idx_vehicle_status` (`status`),
  ADD KEY `idx_vehicle_type` (`vehicle_type`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cargo`
--
ALTER TABLE `cargo`
  MODIFY `cargo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `driver_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `expense_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `fuel_logs`
--
ALTER TABLE `fuel_logs`
  MODIFY `fuel_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  MODIFY `maintenance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `trips`
--
ALTER TABLE `trips`
  MODIFY `trip_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehicle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `fk_expense_trip` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`trip_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_expense_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `fuel_logs`
--
ALTER TABLE `fuel_logs`
  ADD CONSTRAINT `fk_fuel_trip` FOREIGN KEY (`trip_id`) REFERENCES `trips` (`trip_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_fuel_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `maintenance_logs`
--
ALTER TABLE `maintenance_logs`
  ADD CONSTRAINT `fk_maintenance_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `trips`
--
ALTER TABLE `trips`
  ADD CONSTRAINT `fk_trip_cargo` FOREIGN KEY (`cargo_id`) REFERENCES `cargo` (`cargo_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_trip_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_trip_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON UPDATE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
