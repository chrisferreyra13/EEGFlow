# Generated by Django 3.0.7 on 2021-03-18 21:34

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='FileInfo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('upload_id', models.CharField(max_length=22)),
                ('proj_id', models.CharField(max_length=50, null=True)),
                ('proj_name', models.CharField(max_length=50, null=True)),
                ('experimenter', models.CharField(max_length=50, null=True)),
                ('meas_date', models.DateTimeField(null=True)),
                ('nchan', models.IntegerField(null=True)),
                ('ch_names', models.CharField(max_length=500, null=True)),
                ('custom_ref_applied', models.BooleanField(null=True)),
            ],
        ),
    ]
