bring up the new schema yourself.
We have several type of excel files. We go to first type of excel file. These type is like 1405.xlsx file. we must fill our database with this file step by step.
Date in excel files are in jalali.
1405 is name of the year. each sheet in this excel file is one day.
1404.xlsx is for 1404.
1403_01_04.xlsx is for month 1 to month 4 of 1403.
1403_04_12.xlsx is for month 4 to month 12 of 1403. We have some duplicate sheet here.
1402.xlsx is for 1402.
1401.xlsx is for 1401.
These files are in the same format. So we must write something that can add all of them to our database.
1 small changes before go furtur. remove supervisor_id from line_shift_report and add it to shift. because we have one supervisor in each shift in both lines.
After that this is the plan for filling the database.
You must write the code in a way that if you can't read data from one sheet, we know which sheet exactly have problem and problem is in which phase of filling database.

- read the excel file.
- read each day.
- create 2 shift for each day. one shift for day. and one shift for night.
- get supervisor name for each shift. At top of the sheet we have these data and fill the database with it.
- add 2 row per shift in line_shift_report. one for line 1 and another for line 2.
- read feed_tonnage and production_tonnage and recovery from excel file. just daily feed is important for us. monthly and yearly are not important and has no field in our database. We can create them after filling database with query ourselves. For reading recovery you must consider that if feed is 0, we must consider recovery as 0 (for not seeing devision by 0)
- If load is available (In some version of excel file this field is not available,), check the loads table to see if it's available on that table or not. if it's not available on loads table, add it to this table and save the id in line_shift_report. if it's available on loads table, just add the id to line_shift_report.
-  write ton_per_hour and and drum_filter_1_hour and drum_filter_2_hour and filter_press_operation_hour and filter_press_downtime_hour and flocculant_grams and flocculant_type.

All of this is on top of the excel file.
Write a code to read and fill database until this phase. check your code on 5 sheet of 1405.xlsx, 1404.xlsx, 1403_01_04.xlsx, 1403_04_12.xlsx, 1402.xlsx and 1401.xlsx. if your code is ok on all of that random sheets, we go to the next phase.





you must get shift_id and line_shift_id for line 1 and line_shift_id for line 2. we must add data to these after that.

- read water_consumption of each shift and add it to shift data.

- read primary_mill_30, primary_mill_40, primary_mill_50, primary_mill_60, secondary_mill_25, secondary_mill_30, secondary_mill_40, secondary_mill_50.


- read factory_downtime and input_feed_downtime data from in front of mill section.
if after factroy_downtim we have input_feed_downtime with name of something like 'توقف خط' and time of downtime is exactly the same, this input_feed_downtime must have factory_downtime_id, in other cases, factory_downtime_id is null.
all factory_downtime and input_feed_downtime, must related to the corresponding line_shift_report.

- read filter_press_downtime for day and for night data.

- 


- add fe_input_feed and feo_input_feed and fe_concentrate_and feo_concentrate_and 
feo_thickener_tailing from initilas of end rows.

- read all k80 size data. this means k80_size_input_feed, k80_size_primary_ballmill, k80_size_secondary_ballmill, k80_size_hydrocyclone_overflow_1, k80_size_hydrocyclone_overflow_2, k80_size_tailing, k80_size_concentrate

- read dry_weight_recovery, metallurgical_recovery, separation_efficiency.

- read moisture data's. this means input_feed_moisture, concentrate_moisture, filter_press_cake_moisture

read fe_first_ballmill_output and feo_first_ballmill_output from end of end rows.

create a function to read all of the data above and write it to database.
after read all of the data and write them to database, get shift_id, and line_shift_id for line 1 and line_shift_id for line 2 as output.

check your code on 5 sheet of 1405.xlsx, 1404.xlsx, 1403_01_04.xlsx, 1403_04_12.xlsx, 1402.xlsx and 1401.xlsx. if your code is ok on all of that random sheets everything is ok. save your code. flush database. and run your code on 6 excel file entirely:
(1405.xlsx, 1404.xlsx, 1403_01_04.xlsx, 1403_04_12.xlsx, 1402.xlsx and 1401.xlsx.)
use sonnet for text_reading inside of cells.