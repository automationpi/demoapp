import java.io.File;
import java.io.RandomAccessFile;
import java.util.Scanner;

public class Main {

    static String testngXML = "";

    static void createTestNG(String testName,String testId){

        testngXML = testngXML + "<test name='"+testName+"'>\n" +
                "        <parameter name='testname' value='"+testName+"' />\n" +
                "        <parameter name='testid' value='"+testId+"' />\n" +
                "        <classes>\n" +
                "            <class name='TestDriver'>\n" +
                "                <methods>\n" +
                "                    <include name='Dolphin' />\n" +
                "                </methods>\n" +
                "            </class>\n" +
                "        </classes>\n" +
                "    </test>\n\n\n\n";

    }


    public static void main(String[] args) {

        String fileName = "./file.nntest";

        try{
            RandomAccessFile rf = new RandomAccessFile("./file.no", "rw");
            File myFile = new File(fileName);
            Scanner scan = new Scanner(myFile);
            String[] split;

            int flag = 0;
            String testName = "";
            String testID = "";

            while (scan.hasNextLine()) {
                String line = scan.nextLine();


                if(line.startsWith("-")) {
                    testName = line.substring(1);
                    flag = 1;
                }

                if(line.startsWith("#")) {
                    testID = line.substring(1);
                    flag = 2;
                }

                if(flag==2){
                    createTestNG(testName,testID);
                    testID="";
                    testName = "";
                    flag=0;
                }



                else if (line.equalsIgnoreCase("")){
                    if(flag==1){
                        createTestNG(testName,testID);
                        testID="";
                        testName = "";
                        flag=0;
                    }
                }
            }

            if(flag==1){
                createTestNG(testName,testID);
                testID="";
                testName = "";
                flag=0;
            }

            scan.close();

            System.out.print(testngXML);
        }catch (Exception e){
            System.out.println(e.getMessage());

        }


    }
}
