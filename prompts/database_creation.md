I want to delete all database and code for ingestion. I want to create database step by step myself and you help me in that.
I want to create these tables with schema docs now.

Table1: supervisors 
  --id: int // Primary key
  --name: string  // Name of supervisor

Table2: shift   
  --id: int // Primary key
  --shift: enum('day', 'night')   // Each shift can be day or night. nothing else in this time.
  --date: date  // Date of the report. (Changed from datetime to date, as shift indicates the time).
  --jalali_date: string // Correspond to date field (Persian calendar date).
  --water_consumption: float // We have water consumption in each shift (in cubic meter). Float is safer than int for volumes.

Table3: line_shift_report   
  --id: int // Primary key
  --shift_id: int // FOREIGN KEY: Links this report to the specific shift in Table2 (CRITICAL ADDITION)
  --supervisor_id: int // FOREIGN KEY: id of the supervisor
  --line_number: enum(1, 2) // We have 2 lines currently. line 1 and line 2. Just this.
  --input_feed_tonnage: int // How much input feed gets to this line in this shift
  --production_tonnage: int // How much production happens in this line in this shift
  --recovery: float // Calculated by production_tonnage/input_feed_tonnage. Percentage of input that becomes output. In case of input_feed_tonnage is 0, recovery is 0 too.
  --load_code: string // Each input_feed has a code. This is the code of the load.
  --operation_hour: float // The time that this line is in operation without any stop
  --downtime_hour: float // Stop time of this line in this shift
  --ton_per_hour: float // Calculated by input_feed_tonnage/operation_hour
  --drum_filter_1_hour: float // Operational hours for drum filter 1
  --drum_filter_2_hour: float // Operational hours for drum filter 2
  --filter_press_operation_hour: float // Total operation hours for the filter press
  --filter_press_downtime_hour: float // Total downtime/stop hours for the filter press
  --flocculant_consumption_grams: int // Amount of flocculant consumed in grams
  --flocculant_type: string // The specific code or type of flocculant used (e.g., A28)
  --primary_mill_30: int // Number of 30mm balls added to the primary mill
  --primary_mill_40: int // Number of 40mm balls added to the primary mill
  --primary_mill_50: int // Number of 50mm balls added to the primary mill
  --primary_mill_60: int // Number of 60mm balls added to the primary mill
  --secondary_mill_25: int // Number of 25mm balls added to the secondary mill
  --secondary_mill_30: int // Number of 30mm balls added to the secondary mill
  --secondary_mill_40: int // Number of 40mm balls added to the secondary mill
  --secondary_mill_50: int // Number of 50mm balls added to the secondary mill
  --fe_input_feed: float // Percentage of Iron (Fe) in the input feed
  --feo_input_feed: float // Percentage of Iron(II) oxide (FeO) in the input feed
  --fe_concentrate: float // Percentage of Iron (Fe) in the final concentrate
  --feo_concentrate: float // Percentage of Iron(II) oxide (FeO) in the final concentrate
  --fe_thickener_tailing: float // Percentage of Iron (Fe) in the thickener tailing
  --feo_thickener_tailing: float // Percentage of Iron(II) oxide (FeO) in the thickener tailing
  --k80_size_input_feed: int // K80 particle size (microns) of the input feed
  --k80_size_primary_ballmill: int // K80 particle size (microns) exiting the primary ball mill
  --k80_size_secondary_ballmill: int // K80 particle size (microns) exiting the secondary ball mill
  --k80_size_hydrocyclone_overflow_1: int // K80 particle size (microns) at hydrocyclone overflow 1
  --k80_size_hydrocyclone_overflow_2: int // K80 particle size (microns) at hydrocyclone overflow 2
  --k80_size_tailing: int // K80 particle size (microns) of the tailings
  --k80_size_concentrate: int // K80 particle size (microns) of the concentrate
  --dry_weight_recovery: float // Calculated dry weight recovery percentage
  --metallurgical_recovery: float // Calculated metallurgical recovery percentage
  --seperation_efficiency: float // Overall separation efficiency percentage
  --input_feed_moisture: float // Moisture percentage in the input feed
  --concentrate_moisture: float // Moisture percentage in the final concentrate
  --filter_press_cake_moisture: float // Moisture percentage in the filter press cake
  --fe_first_balmill_output: float // Percentage of Iron (Fe) from the first ball mill output
  --feo_first_balmill_output: float // Percentage of Iron(II) oxide (FeO) from the first ball mill output

Table4: factory_downtime
  --id: int // Primary key
  --line_shift_report_id: int // FOREIGN KEY: Links to Table3
  --description: text // Description/reason for the factory downtime
  --duration: int // Duration of the downtime in minutes

Table5: input_feed_downtime
  --id: int // Primary key
  --line_shift_report_id: int // FOREIGN KEY: Links to Table3
  --factory_downtime_id: int // FOREIGN KEY: Links to Table4. If feed stopped due to factory stop, this connects them. Otherwise null.
  --description: text // Description/reason for the input feed downtime
  --duration: int // Duration of the downtime in minutes

Table6: filter_press_downtime
  --id: int // Primary key
  --line_shift_report_id: int // FOREIGN KEY: Links to Table3
  --description: text // Description/reason for the filter press downtime
  --duration: int // Duration of the downtime in minutes


Do you have any suggestion for my table creations. this table is based on attached excel file.